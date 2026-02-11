import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateTask } from '@/lib/db';

export default function MiniTaskList() {
  const tasks = useLiveQuery(
    () => db.tasks.where('status').equals('todo').reverse().sortBy('createdAt'),
    []
  );

  const handleToggle = (id: number) => {
    updateTask(id, { status: 'done', completedAt: new Date() });
  };

  if (!tasks) return null;

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
        没有待办任务
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/40 transition-colors group"
        >
          <button
            onClick={() => task.id && handleToggle(task.id)}
            className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 hover:border-blue-400 transition-colors flex items-center justify-center"
          >
            <span className="w-2 h-2 rounded-full bg-transparent group-hover:bg-blue-200 transition-colors" />
          </button>
          <span className="text-xs text-slate-700 truncate">{task.title}</span>
        </div>
      ))}
    </div>
  );
}
