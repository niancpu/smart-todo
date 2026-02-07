import { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateTask } from '@/lib/db';
import type { Task, Category, Priority } from '@/types';
import TaskCard from '@/components/task/TaskCard';

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'work', label: '工作' },
  { value: 'personal', label: '个人' },
  { value: 'health', label: '健康' },
  { value: 'study', label: '学习' },
  { value: 'shopping', label: '购物' },
];

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'urgent', label: '紧急', color: 'bg-red-500' },
  { value: 'high', label: '高', color: 'bg-orange-500' },
  { value: 'medium', label: '中', color: 'bg-blue-500' },
  { value: 'low', label: '低', color: 'bg-gray-400' },
];

type DropdownType = 'category' | 'priority';

export default function Inbox() {
  const tasks = useLiveQuery(() =>
    db.tasks.filter((t) => t.category === 'other' || !t.dueDate).toArray()
  );

  const [openDropdown, setOpenDropdown] = useState<{ taskId: number; type: DropdownType } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCategoryChange = async (taskId: number, category: Category) => {
    await updateTask(taskId, { category });
    setOpenDropdown(null);
  };

  const handlePriorityChange = async (taskId: number, priority: Priority) => {
    await updateTask(taskId, { priority });
    setOpenDropdown(null);
  };

  const toggleDropdown = (taskId: number, type: DropdownType) => {
    setOpenDropdown((prev) =>
      prev?.taskId === taskId && prev.type === type ? null : { taskId, type }
    );
  };

  const pendingTasks = tasks?.filter((t) => t.status !== 'done') ?? [];
  const doneTasks = tasks?.filter((t) => t.status === 'done') ?? [];

  const renderActions = (task: Task) => {
    const taskId = task.id!;
    return (
      <div className="relative flex items-center gap-1 ml-2 flex-shrink-0" ref={openDropdown?.taskId === taskId ? dropdownRef : undefined}>
        <button
          onClick={(e) => { e.stopPropagation(); toggleDropdown(taskId, 'category'); }}
          className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 text-gray-500"
          title="快速分类"
        >
          分类
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleDropdown(taskId, 'priority'); }}
          className="px-2 py-1 text-xs rounded border border-gray-200 hover:bg-gray-100 text-gray-500"
          title="设置优先级"
        >
          优先级
        </button>

        {openDropdown?.taskId === taskId && openDropdown.type === 'category' && (
          <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); handleCategoryChange(taskId, opt.value); }}
                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${task.category === opt.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {openDropdown?.taskId === taskId && openDropdown.type === 'priority' && (
          <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); handlePriorityChange(taskId, opt.value); }}
                className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 ${task.priority === opt.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
              >
                <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">收集箱</h1>
        <p className="text-sm text-gray-500 mt-1">
          {pendingTasks.length > 0
            ? `${pendingTasks.length} 个待处理任务`
            : '没有待处理任务'}
        </p>
      </div>

      {tasks === undefined ? (
        <div className="text-center py-12 text-gray-400">加载中...</div>
      ) : pendingTasks.length === 0 && doneTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3 text-gray-300">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">收集箱为空</p>
          <p className="text-sm text-gray-400 mt-1">所有任务都已分类处理</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <TaskCard task={task} />
                  </div>
                  {renderActions(task)}
                </div>
              ))}
            </div>
          )}

          {doneTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-gray-400 mb-2 mt-4">已完成</h2>
              <div className="space-y-2">
                {doneTasks.map((task) => (
                  <div key={task.id} className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <TaskCard task={task} />
                    </div>
                    {renderActions(task)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
