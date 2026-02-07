import { useTasks, useTaskStore } from '@/features/task/hooks';
import TaskCard from './TaskCard';
import type { Status } from '@/types';

const statusTabs: { label: string; value: Status | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '待办', value: 'todo' },
  { label: '已完成', value: 'done' },
];

export default function TaskList() {
  const { filter, setFilter } = useTaskStore();
  const tasks = useTasks(filter);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 glass-light p-1 rounded-xl w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter({ status: tab.value })}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
              (filter.status ?? 'all') === tab.value
                ? 'bg-white/80 text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 stagger-children">
        {tasks.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-400 text-sm">还没有任务，试试用自然语言添加一个吧</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
