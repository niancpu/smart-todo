import TaskInput from '@/components/task/TaskInput';
import TaskList from '@/components/task/TaskList';
import TaskDetail from '@/components/task/TaskDetail';

export default function Home() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">智能待办清单</h2>
      <TaskInput />
      <TaskList />
      <TaskDetail />
    </div>
  );
}
