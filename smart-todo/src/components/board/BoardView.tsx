import { useCallback, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { useBoardConfig, useBoardTasks, checkWipLimit } from '@/features/board/hooks';
import { updateTask, changeTaskStatus, saveBoardConfig } from '@/lib/db';
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
    const { source, destination } = result;
    if (!destination || !config) return;

    // 拖拽列：重排列顺序，持久化到配置
    if (result.type === 'COLUMN') {
      if (source.index === destination.index) return;
      const reordered = [...config.columns].sort((a, b) => a.order - b.order);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      const updated = reordered.map((col, i) => ({ ...col, order: i }));
      await saveBoardConfig({ ...config, columns: updated });
      return;
    }

    // 拖拽卡片：移动任务
    const sameColumn = source.droppableId === destination.droppableId;
    const destColumn = config.columns.find(c => c.id === destination.droppableId);
    if (!destColumn) return;

    if (!sameColumn) {
      const destTasks = tasksByColumn[destination.droppableId] ?? [];
      if (checkWipLimit(destColumn, destTasks.length)) {
        setWipWarning(true);
        setTimeout(() => setWipWarning(false), 2000);
        return;
      }
    }

    const taskId = Number(result.draggableId);
    const destTasks = [...(tasksByColumn[destination.droppableId] ?? [])];

    if (sameColumn) {
      const [moved] = destTasks.splice(source.index, 1);
      destTasks.splice(destination.index, 0, moved);
    } else {
      const task = allTasks.find(t => t.id === taskId);
      if (!task) return;
      destTasks.splice(destination.index, 0, task);
    }

    const updates = destTasks.map((task, index) =>
      updateTask(task.id!, { sortOrder: index })
    );

    // 跨列移动时：通过 changeTaskStatus 处理 doing 计时和 completedAt
    if (!sameColumn) {
      await changeTaskStatus(taskId, destination.droppableId);
    }

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
        <Droppable droppableId="board" type="COLUMN" direction="horizontal">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex gap-4 flex-1 min-h-0 overflow-x-auto"
            >
              {sortedColumns.map((column, index) => {
                const tasks = tasksByColumn[column.id] ?? [];
                const isOverWip = checkWipLimit(column, tasks.length);
                return (
                  <Draggable key={column.id} draggableId={column.id} index={index}>
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className="flex flex-col flex-1 min-w-[180px]"
                      >
                        <BoardColumn
                          column={column}
                          tasks={tasks}
                          isOverWip={isOverWip}
                          dragHandleProps={dragProvided.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
