import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { AIMessageList } from './chat/AIMessageList';
import { AIMessageInput } from './chat/AIMessageInput';
import { AIWelcomeMessage } from './AIWelcomeMessage';
import { AISuggestions } from './AISuggestions';
import { useAI } from '../../hooks/useAI';

interface AIChatProps {
  onClose: () => void;
  onNewMessage?: () => void;
}

export function AIChat({ onClose, onNewMessage }: AIChatProps) {
  const { messages, sendMessage, isLoading } = useAI();

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">AI Assistant</h3>
          <p className="text-xs text-blue-100">How can I help you?</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-white hover:text-blue-100 p-1"
          aria-label="Close assistant"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="h-[500px] flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 overflow-y-auto">
            <AIWelcomeMessage />
            <AISuggestions
              suggestions={[
                'What services do you offer?',
                'How can I schedule a consultation?',
                'What are your business hours?'
              ]}
              onSelect={sendMessage}
            />
          </div>
        ) : (
          <AIMessageList messages={messages} isTyping={isLoading} />
        )}

        <AIMessageInput
          onSend={(content) => {
            sendMessage(content);
            onNewMessage?.();
          }}
          isDisabled={isLoading}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
}