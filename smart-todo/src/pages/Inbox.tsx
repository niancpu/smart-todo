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
  { value: 'urgent', label: '紧急', color: 'bg-red-400' },
  { value: 'high', label: '高', color: 'bg-orange-400' },
  { value: 'medium', label: '中', color: 'bg-blue-400' },
  { value: 'low', label: '低', color: 'bg-slate-300' },
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
          className="px-2 py-1 text-xs rounded-lg glass-light text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all"
          title="快速分类"
        >
          分类
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); toggleDropdown(taskId, 'priority'); }}
          className="px-2 py-1 text-xs rounded-lg glass-light text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all"
          title="设置优先级"
        >
          优先级
        </button>

        {openDropdown?.taskId === taskId && openDropdown.type === 'category' && (
          <div className="absolute right-0 top-8 z-10 glass-heavy rounded-xl py-1 min-w-[100px] animate-scale-in">
            {categoryOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); handleCategoryChange(taskId, opt.value); }}
                className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-white/40 transition-colors ${task.category === opt.value ? 'text-accent font-medium' : 'text-slate-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {openDropdown?.taskId === taskId && openDropdown.type === 'priority' && (
          <div className="absolute right-0 top-8 z-10 glass-heavy rounded-xl py-1 min-w-[100px] animate-scale-in">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={(e) => { e.stopPropagation(); handlePriorityChange(taskId, opt.value); }}
                className={`flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-white/40 transition-colors ${task.priority === opt.value ? 'text-accent font-medium' : 'text-slate-600'}`}
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-xl font-display font-semibold text-slate-800">收集箱</h1>
        <p className="text-sm text-slate-400 mt-1">
          {pendingTasks.length > 0
            ? `${pendingTasks.length} 个待处理任务`
            : '没有待处理任务'}
        </p>
      </div>

      {tasks === undefined ? (
        <div className="text-center py-12 text-slate-400">
          <svg className="w-6 h-6 mx-auto animate-spin text-accent" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" className="opacity-30" />
            <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      ) : pendingTasks.length === 0 && doneTasks.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <svg className="w-16 h-16 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-slate-500 font-display font-medium">收集箱为空</p>
          <p className="text-sm text-slate-400 mt-1">所有任务都已分类处理</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingTasks.length > 0 && (
            <div className="space-y-2 stagger-children">
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
              <h2 className="text-sm font-medium text-slate-400 mb-2 mt-4">已完成</h2>
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
