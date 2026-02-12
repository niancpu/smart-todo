import { Droppable } from '@hello-pangea/dnd';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import type { Task, BoardColumn as BoardColumnType } from '@/types';
import BoardCard from './BoardCard';

interface Props {
  column: BoardColumnType;
  tasks: Task[];
  isOverWip: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
}

export default function BoardColumn({ column, tasks, isOverWip, dragHandleProps }: Props) {
  return (
    <div className="flex flex-col flex-1 bg-white/60 rounded-2xl p-3">
      {/* 列头（拖拽手柄） */}
      <div
        {...dragHandleProps}
        className="flex items-center justify-between px-1 py-1 mb-2 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="flex items-center gap-2">
          {/* 拖拽指示图标 */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-300 flex-shrink-0">
            <circle cx="9" cy="6" r="1.5" fill="currentColor" />
            <circle cx="15" cy="6" r="1.5" fill="currentColor" />
            <circle cx="9" cy="12" r="1.5" fill="currentColor" />
            <circle cx="15" cy="12" r="1.5" fill="currentColor" />
            <circle cx="9" cy="18" r="1.5" fill="currentColor" />
            <circle cx="15" cy="18" r="1.5" fill="currentColor" />
          </svg>
          <h3 className="text-sm font-semibold text-slate-700">{column.name}</h3>
          <span className="text-xs text-slate-400 bg-slate-100/60 px-1.5 py-0.5 rounded-md">
            {tasks.length}
          </span>
        </div>
        {column.wipLimit != null && (
          <span className={`text-xs px-1.5 py-0.5 rounded-md ${
            isOverWip ? 'bg-red-100 text-red-500 font-medium' : 'text-slate-400 bg-slate-100/40'
          }`}>
            WIP {column.wipLimit}
          </span>
        )}
      </div>

      {/* WIP 警告 */}
      {isOverWip && (
        <div className="mb-2 px-2 py-1.5 rounded-lg bg-red-50/80 border border-red-200/50 text-xs text-red-500">
          不宜进行多线任务。
        </div>
      )}

      {/* 可放置区域 */}
      <Droppable droppableId={column.id} type="CARD">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-1 rounded-xl space-y-2 min-h-[120px] transition-colors duration-200 ${
              snapshot.isDraggingOver
                ? 'bg-accent/5 ring-2 ring-accent/10 ring-dashed'
                : ''
            }`}
          >
            {tasks.map((task, index) => (
              <BoardCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
