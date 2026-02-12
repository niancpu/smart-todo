import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateTask } from '@/lib/db';
import type { Task } from '@/types';

const STORAGE_KEY = 'smart-todo-mini-board-statuses';

export default function MiniBoardView() {
  const visibleStatuses: string[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || '["doing"]'
  );

  const liveTasks = useLiveQuery(
    () => db.tasks.where('status').anyOf(visibleStatuses).sortBy('sortOrder'),
    [visibleStatuses.join()]
  );

  const [localTasks, setLocalTasks] = useState<Task[] | undefined>(liveTasks);
  const [archiveId, setArchiveId] = useState<number | null>(null);

  // 数据库变化时同步到本地
  useEffect(() => { setLocalTasks(liveTasks); }, [liveTasks]);

  const tasks = localTasks;

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !tasks) return;
    const reordered = [...tasks];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    // 乐观更新：立刻更新本地状态
    setLocalTasks(reordered);
    // 单事务批量写入，useLiveQuery 只触发一次
    await db.transaction('rw', db.tasks, async () => {
      for (let i = 0; i < reordered.length; i++) {
        await updateTask(reordered[i].id!, { sortOrder: i });
      }
    });
  };

  const handleArchive = async (id: number, status: 'done' | 'dropped') => {
    await updateTask(id, {
      status,
      completedAt: status === 'done' ? new Date() : undefined,
    });
    setArchiveId(null);
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
    <div className="flex-1 overflow-y-auto px-3 py-1">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="mini-doing">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-sm transition-colors ${
                        snapshot.isDragging
                          ? 'bg-white/80'
                          : 'bg-white/50 hover:bg-white/70'
                      }`}
                    >
                      <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium ${
                        task.status === 'doing'
                          ? 'bg-blue-100 text-blue-600'
                          : task.status === 'done'
                            ? 'bg-emerald-100 text-emerald-600'
                            : task.status === 'dropped'
                              ? 'bg-red-100 text-red-500'
                              : 'bg-slate-100 text-slate-500'
                      }`}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </span>
                      <span className="text-xs text-slate-700 truncate flex-1">{task.title}</span>

                      {/* 归档按钮 */}
                      <div className="relative shrink-0">
                        <button
                          onClick={() => setArchiveId(archiveId === task.id ? null : task.id!)}
                          className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Archive
                        </button>

                        {archiveId === task.id && (
                          <div className="absolute right-0 top-6 z-10 glass-heavy rounded-lg shadow-lg py-1 min-w-[80px]">
                            <button
                              onClick={() => handleArchive(task.id!, 'done')}
                              className="w-full px-3 py-1 text-[11px] text-emerald-600 hover:bg-white/40 text-left"
                            >
                              Done
                            </button>
                            <button
                              onClick={() => handleArchive(task.id!, 'dropped')}
                              className="w-full px-3 py-1 text-[11px] text-red-500 hover:bg-white/40 text-left"
                            >
                              Drop
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
