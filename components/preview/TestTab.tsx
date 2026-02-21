'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { generateChatResponse } from '@/lib/simulators/mcpTestSimulator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Trash2 } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

export function TestTab() {
  const { tools, messages, addMessage, clearMessages } = useStore();
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || tools.length === 0) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Generate and add response
    const response = generateChatResponse(input, tools);
    setTimeout(() => {
      addMessage(response);
    }, 500);

    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Test Playground</h3>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {tools.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-center">
          <div className="text-muted-foreground">
            <div className="text-4xl mb-4">🧪</div>
            <p>No tools to test</p>
            <p className="text-sm mt-2">Add tools to start testing</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-muted-foreground">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-sm">Send a message to test your tools</p>
                  <div className="text-xs mt-4 space-y-1">
                    <p>Try: "Search for TypeScript best practices"</p>
                    <p>Or: "Read package.json"</p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'glass-panel'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    {message.toolCall && (
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <div className="text-xs opacity-75">
                          <div className="font-medium">Tool Called: {message.toolCall.toolName}</div>
                          <pre className="mt-1 text-xs">
                            {JSON.stringify(message.toolCall.parameters, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Test your tools..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
