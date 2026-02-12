import { Draggable } from '@hello-pangea/dnd';
import type { Task, Category } from '@/types';

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-blue-400',
  low: 'bg-slate-300',
};

const categoryLabels: Record<Category, string> = {
  work: '工作', personal: '个人', health: '健康', study: '学习', shopping: '购物', other: '其他',
};

interface Props {
  task: Task;
  index: number;
}

export default function BoardCard({ task, index }: Props) {
  return (
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-3 rounded-xl transition-all duration-150 select-none ${
            snapshot.isDragging
              ? 'glass-heavy shadow-glow ring-2 ring-accent/20 rotate-2'
              : 'glass hover:shadow-glass-hover'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`} />
            <span className="text-sm text-slate-700 font-medium truncate">{task.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs bg-white/40 text-slate-500 px-1.5 py-0.5 rounded-md">
              {categoryLabels[task.category]}
            </span>
            {task.estimatedMinutes && (
              <span className="text-xs text-slate-400">{task.estimatedMinutes}分钟</span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
