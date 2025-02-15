import { Message as VercelChatMessage } from 'ai';
import { RunnableSequence } from '@langchain/core/runnables';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';

import { HttpResponseOutputParser } from 'langchain/output_parsers';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { formatDocumentsAsString } from 'langchain/util/document';

const loader = new JSONLoader('data/states.json', [
  '/state',
  '/code',
  '/nickname',
  '/website',
  '/admission_date',
  '/admission_number',
  '/capital_city',
  '/capital_url',
  '/population',
  '/population_rank',
  '/constitution_url',
  '/twitter_url',
]);
const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `
Answer the user's questions based only on the following context. 
If the answer is not in the context, reply politely that you do not have that information available.:
==============================
Context: {context}
==============================
Current conversation: {chat_history}

user: {question}
assistant:`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);

    const currentMessageContent = messages[messages.length - 1].content;

    const docs = await loader.load();

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);

    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'gpt-3.5-turbo',
      temperature: 0,
      streaming: true,
    });

    const parser = new HttpResponseOutputParser();

    const chain = RunnableSequence.from([
      {
        question: (input) => input.question,
        chat_history: (input) => input.chat_history,
        context: () => formatDocumentsAsString(docs),
      },
      prompt,
      model,
      parser,
    ]);

    const stream = await chain.stream({
      chat_history: formattedPreviousMessages.join('\n'),
      question: currentMessageContent,
    });

    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('라우팅 오류:', error);
    return new Response(JSON.stringify({ error: '처리 실패' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
