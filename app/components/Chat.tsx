'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    streamProtocol: 'text',
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="space-y-4 mb-6">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-50 border border-blue-200 ml-6'
                : 'bg-gray-50 border border-gray-200 mr-6'
            }`}
          >
            <p className="font-medium text-sm mb-1">{m.role === 'user' ? 'You' : 'AI'}</p>
            <p className="text-gray-800">{m.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="메시지 입력..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          전송
        </button>
      </form>
    </div>
  );
}
