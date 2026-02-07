import { useState } from 'react';
import { useTask, useUpdateTask, useDeleteTask, useTaskStore } from '@/features/task/hooks';
import TaskEditForm from './TaskEditForm';
import { formatRelativeDate, formatDate, isOverdue } from '@/utils/date';
import type { Task, Priority, Category, Status } from '@/types';

const priorityLabels: Record<Priority, string> = {
  urgent: '紧急', high: '高', medium: '中', low: '低',
};
const priorityColors: Record<Priority, string> = {
  urgent: 'bg-red-400/15 text-red-600', high: 'bg-orange-400/15 text-orange-600',
  medium: 'bg-blue-400/15 text-blue-600', low: 'bg-slate-400/15 text-slate-500',
};
const categoryLabels: Record<Category, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};
const statusLabels: Record<Status, string> = {
  todo: '待办', in_progress: '进行中', done: '已完成',
};
const statusColors: Record<Status, string> = {
  todo: 'bg-slate-400/15 text-slate-600', in_progress: 'bg-blue-400/15 text-blue-600', done: 'bg-emerald-400/15 text-emerald-600',
};

export default function TaskDetail() {
  const selectedId = useTaskStore((s) => s.selectedTaskId);
  const selectTask = useTaskStore((s) => s.selectTask);
  const task = useTask(selectedId);
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (selectedId == null || !task) return null;

  const overdue = task.status !== 'done' && isOverdue(task.dueDate);

  const handleStatusChange = async (status: Status) => {
    await update(task.id!, {
      status,
      completedAt: status === 'done' ? new Date() : undefined,
    });
  };

  const handleSave = async (changes: Partial<Task>) => {
    await update(task.id!, changes);
    setEditing(false);
  };

  const handleDelete = async () => {
    await remove(task.id!);
    setConfirmDelete(false);
  };

  const close = () => {
    selectTask(null);
    setEditing(false);
    setConfirmDelete(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 animate-fade-in" onClick={close} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md glass-heavy z-50 flex flex-col animate-slide-in-right shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
          <h2 className="text-base font-display font-semibold text-slate-800">任务详情</h2>
          <button onClick={close} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/40 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {editing ? (
            <TaskEditForm task={task} onSave={handleSave} onCancel={() => setEditing(false)} />
          ) : (
            <div className="space-y-5">
              {/* Title & Status */}
              <div>
                <h3 className={`text-lg font-display font-medium ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mt-2 text-sm text-slate-500 whitespace-pre-wrap">{task.description}</p>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg font-medium bg-white/40 text-slate-500">
                  {categoryLabels[task.category]}
                </span>
              </div>

              {/* Fields */}
              <div className="space-y-3 text-sm">
                {task.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">截止日期</span>
                    <span className={overdue ? 'text-red-500 font-medium' : 'text-slate-700'}>
                      {formatDate(task.dueDate)} ({formatRelativeDate(task.dueDate)})
                    </span>
                  </div>
                )}
                {task.estimatedMinutes != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">预估时间</span>
                    <span className="text-slate-700">{task.estimatedMinutes} 分钟</span>
                  </div>
                )}
                {task.actualMinutes != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">实际时间</span>
                    <span className="text-slate-700">{task.actualMinutes} 分钟</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">创建时间</span>
                  <span className="text-slate-700">{formatDate(task.createdAt)}</span>
                </div>
                {task.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">完成时间</span>
                    <span className="text-slate-700">{formatDate(task.completedAt)}</span>
                  </div>
                )}
                {task.aiConfidence != null && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">AI 置信度</span>
                    <span className="text-slate-700">{Math.round(task.aiConfidence * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1.5">标签</span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white/50 text-slate-500 px-2 py-0.5 rounded-md">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Input */}
              {task.rawInput && (
                <div>
                  <span className="text-xs text-slate-400 block mb-1">原始输入</span>
                  <p className="text-sm text-slate-400 italic">"{task.rawInput}"</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-2 space-y-2">
                <span className="text-xs text-slate-400 block">状态操作</span>
                <div className="flex flex-wrap gap-2">
                  {task.status === 'todo' && (
                    <>
                      <button onClick={() => handleStatusChange('in_progress')} className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-400/10 rounded-lg hover:bg-blue-400/20 transition-colors">
                        开始执行
                      </button>
                      <button onClick={() => handleStatusChange('done')} className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-400/10 rounded-lg hover:bg-emerald-400/20 transition-colors">
                        标记完成
                      </button>
                    </>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button onClick={() => handleStatusChange('done')} className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-400/10 rounded-lg hover:bg-emerald-400/20 transition-colors">
                        标记完成
                      </button>
                      <button onClick={() => handleStatusChange('todo')} className="px-3 py-1.5 text-xs font-medium text-slate-500 bg-white/40 rounded-lg hover:bg-white/60 transition-colors">
                        退回待办
                      </button>
                    </>
                  )}
                  {task.status === 'done' && (
                    <button onClick={() => handleStatusChange('todo')} className="px-3 py-1.5 text-xs font-medium text-orange-600 bg-orange-400/10 rounded-lg hover:bg-orange-400/20 transition-colors">
                      重新打开
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!editing && (
          <div className="px-5 py-3 border-t border-white/20 flex gap-2">
            <button onClick={() => setEditing(true)} className="flex-1 px-4 py-2 text-sm font-medium text-accent border border-accent/20 rounded-xl hover:bg-accent/5 transition-all">
              编辑
            </button>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors">
                  确认删除
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-sm font-medium text-slate-500 border border-white/30 rounded-xl hover:bg-white/40 transition-colors">
                  取消
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 text-sm font-medium text-red-400 border border-red-200/30 rounded-xl hover:bg-red-50/50 transition-colors">
                删除
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
