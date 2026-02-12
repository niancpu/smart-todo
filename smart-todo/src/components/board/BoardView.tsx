import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useBoardConfig, useBoardTasks, checkWipLimit } from '@/features/board/hooks';
import { updateTask } from '@/lib/db';
import BoardColumn from './BoardColumn';
import type { Task } from '@/types';

export default function BoardView() {
  const config = useBoardConfig();
  const allTasks = useBoardTasks();
  const [wipWarning, setWipWarning] = useState(false);

  // 按 status 分组任务
  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    if (!config) return map;
    for (const col of config.columns) {
      map[col.id] = [];
    }
    for (const task of allTasks) {
      if (map[task.status]) {
        map[task.status].push(task);
      }
    }
    return map;
  }, [config, allTasks]);

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || !config) return;

    const sameColumn = source.droppableId === destination.droppableId;
    const destColumn = config.columns.find(c => c.id === destination.droppableId);
    if (!destColumn) return;

    // 跨列移动时检查 WIP 限制
    if (!sameColumn) {
      const destTasks = tasksByColumn[destination.droppableId] ?? [];
      if (checkWipLimit(destColumn, destTasks.length)) {
        setWipWarning(true);
        setTimeout(() => setWipWarning(false), 2000);
        return;
      }
    }

    const taskId = Number(draggableId);

    // 构建目标列的新任务顺序
    const destTasks = [...(tasksByColumn[destination.droppableId] ?? [])];

    if (sameColumn) {
      // 列内排序：从原位置移除，插入新位置
      const [moved] = destTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, moved);
    } else {
      // 跨列：从源列找到任务，插入目标列
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;
      destTasks.splice(destination.index, 0, task);
    }

    // 批量更新 sortOrder
    const updates = destTasks.map((task, index) =>
      updateTask(task.id!, {
        status: destination.droppableId,
        sortOrder: index,
      })
    );
    await Promise.all(updates);
  }, [config, tasksByColumn, allTasks]);

  if (!config) return null;

  const sortedColumns = [...config.columns].sort((a, b) => a.order - b.order);

  return (
    <div
      className="flex flex-col animate-fade-in"
      style={{ height: 'calc(100vh - 48px)' }}
    >
      {/* WIP 超限提示 */}
      {wipWarning && (
        <div className="px-4 py-2 mb-4 rounded-xl bg-red-50/80 border border-red-200/50 text-sm text-red-500 animate-fade-in">
          不宜进行多线任务。
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 flex-1 min-h-0 overflow-x-auto">
          {sortedColumns.map(column => {
            const tasks = tasksByColumn[column.id] ?? [];
            const isOverWip = checkWipLimit(column, tasks.length);
            return (
              <BoardColumn
                key={column.id}
                column={column}
                tasks={tasks}
                isOverWip={isOverWip}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
