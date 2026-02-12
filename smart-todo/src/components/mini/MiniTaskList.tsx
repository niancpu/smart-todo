import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import TaskCard from '@/components/task/TaskCard';

export default function MiniTaskList() {
  const tasks = useLiveQuery(
    () => db.tasks.where('status').equals('todo').reverse().sortBy('createdAt'),
    []
  );

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
        <TaskCard key={task.id} task={task} compact />
      ))}
    </div>
  );
}
