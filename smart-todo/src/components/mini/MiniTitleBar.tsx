import { getCurrentWindow } from '@tauri-apps/api/window';
import { expandToMain } from '@/lib/window';

export default function MiniTitleBar() {
  const handleClose = () => {
    getCurrentWindow().close();
  };

  return (
    <div
      data-tauri-drag-region
      className="h-9 flex items-center justify-between px-3 glass-heavy rounded-t-xl select-none shrink-0"
    >
      {/* Left: logo + title */}
      <div data-tauri-drag-region className="flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
          <rect x="9" y="3" width="6" height="4" rx="1.5" stroke="#3b82f6" strokeWidth="2" />
          <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span data-tauri-drag-region className="text-xs font-semibold text-slate-600">Smart Todo</span>
      </div>

      {/* Right: expand + close */}
      <div className="flex items-center gap-1">
        <button
          onClick={expandToMain}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/50 transition-colors"
          title="展开主窗口"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-red-100 transition-colors"
          title="关闭"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-slate-500 hover:text-red-500">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
