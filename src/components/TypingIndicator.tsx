interface TypingIndicatorProps {
  show: boolean;
}

export const TypingIndicator = ({ show }: TypingIndicatorProps) => {
  if (!show) return null;

  return (
    <div className="flex mb-4">
      <div className="mr-3 flex items-start">
        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-medium">
          AI
        </div>
      </div>
      <div className="max-w-[70%] bg-chat-ai-bg text-chat-ai-fg rounded-2xl px-4 py-3">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
          </div>
          <span className="text-sm ml-2 opacity-70">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};
