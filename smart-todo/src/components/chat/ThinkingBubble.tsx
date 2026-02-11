export default function ThinkingBubble() {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 014 4v2H8V6a4 4 0 014-4z" />
          <rect x="3" y="8" width="18" height="14" rx="2" />
          <circle cx="12" cy="16" r="2" />
        </svg>
      </div>
      <div className="glass rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1 items-center h-5">
          <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
