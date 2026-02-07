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
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter({ status: tab.value })}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              (filter.status ?? 'all') === tab.value
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            还没有任务，试试用自然语言添加一个吧
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
