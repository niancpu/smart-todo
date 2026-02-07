import { useState } from 'react';
import { useTask, useUpdateTask, useDeleteTask, useTaskStore } from '@/features/task/hooks';
import TaskEditForm from './TaskEditForm';
import { formatRelativeDate, formatDate, isOverdue } from '@/utils/date';
import type { Task, Priority, Category, Status } from '@/types';

const priorityLabels: Record<Priority, string> = {
  urgent: '紧急', high: '高', medium: '中', low: '低',
};
const priorityColors: Record<Priority, string> = {
  urgent: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700',
  medium: 'bg-blue-100 text-blue-700', low: 'bg-gray-100 text-gray-600',
};
const categoryLabels: Record<Category, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};
const statusLabels: Record<Status, string> = {
  todo: '待办', in_progress: '进行中', done: '已完成',
};
const statusColors: Record<Status, string> = {
  todo: 'bg-gray-100 text-gray-700', in_progress: 'bg-blue-100 text-blue-700', done: 'bg-green-100 text-green-700',
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
      <div className="fixed inset-0 bg-black/20 z-40" onClick={close} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">任务详情</h2>
          <button onClick={close} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
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
                <h3 className={`text-lg font-medium ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                  {categoryLabels[task.category]}
                </span>
              </div>

              {/* Fields */}
              <div className="space-y-3 text-sm">
                {task.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">截止日期</span>
                    <span className={overdue ? 'text-red-500 font-medium' : 'text-gray-800'}>
                      {formatDate(task.dueDate)} ({formatRelativeDate(task.dueDate)})
                    </span>
                  </div>
                )}
                {task.estimatedMinutes != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">预估时间</span>
                    <span className="text-gray-800">{task.estimatedMinutes} 分钟</span>
                  </div>
                )}
                {task.actualMinutes != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">实际时间</span>
                    <span className="text-gray-800">{task.actualMinutes} 分钟</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">创建时间</span>
                  <span className="text-gray-800">{formatDate(task.createdAt)}</span>
                </div>
                {task.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">完成时间</span>
                    <span className="text-gray-800">{formatDate(task.completedAt)}</span>
                  </div>
                )}
                {task.aiConfidence != null && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">AI 置信度</span>
                    <span className="text-gray-800">{Math.round(task.aiConfidence * 100)}%</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1.5">标签</span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Input */}
              {task.rawInput && (
                <div>
                  <span className="text-xs text-gray-500 block mb-1">原始输入</span>
                  <p className="text-sm text-gray-500 italic">"{task.rawInput}"</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="pt-2 space-y-2">
                <span className="text-xs text-gray-500 block">状态操作</span>
                <div className="flex flex-wrap gap-2">
                  {task.status === 'todo' && (
                    <>
                      <button onClick={() => handleStatusChange('in_progress')} className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        开始执行
                      </button>
                      <button onClick={() => handleStatusChange('done')} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        标记完成
                      </button>
                    </>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button onClick={() => handleStatusChange('done')} className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        标记完成
                      </button>
                      <button onClick={() => handleStatusChange('todo')} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        退回待办
                      </button>
                    </>
                  )}
                  {task.status === 'done' && (
                    <button onClick={() => handleStatusChange('todo')} className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
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
          <div className="px-5 py-3 border-t border-gray-200 flex gap-2">
            <button onClick={() => setEditing(true)} className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              编辑
            </button>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                  确认删除
                </button>
                <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  取消
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                删除
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
