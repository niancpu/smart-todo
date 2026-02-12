import { useState } from 'react';
import MiniTitleBar from './MiniTitleBar';
import MiniChatView from './MiniChatView';
import MiniCalendar from './MiniCalendar';
import MiniTaskList from './MiniTaskList';
import MiniBoardView from './MiniBoardView';

type Tab = 'chat' | 'calendar' | 'tasks' | 'board';

const tabs: { key: Tab; label: string }[] = [
  { key: 'chat', label: '对话' },
  { key: 'board', label: '看板' },
  { key: 'calendar', label: '日历' },
  { key: 'tasks', label: '任务' },
];

export default function MiniApp() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="h-screen flex flex-col overflow-hidden rounded-xl">
      <div className="app-bg" />
      <MiniTitleBar />

      {/* Tab bar */}
      <div className="flex items-center px-3 shrink-0 border-b border-white/15">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 text-[11px] font-medium transition-colors relative ${
              activeTab === tab.key
                ? 'text-accent'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-accent rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'chat' && <MiniChatView />}
      {activeTab === 'board' && <MiniBoardView />}
      {activeTab === 'calendar' && <MiniCalendar />}
      {activeTab === 'tasks' && <MiniTaskList />}
    </div>
  );
}
