import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import type { Priority, Category } from '@/types';

const STORAGE_KEY_PRIORITY = 'smart-todo-default-priority';
const STORAGE_KEY_CATEGORY = 'smart-todo-default-category';

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'urgent', label: '紧急' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
];

const categoryOptions: { value: Category; label: string }[] = [
  { value: 'work', label: '工作' },
  { value: 'personal', label: '个人' },
  { value: 'health', label: '健康' },
  { value: 'study', label: '学习' },
  { value: 'shopping', label: '购物' },
  { value: 'other', label: '其他' },
];

export default function Settings() {
  const [defaultPriority, setDefaultPriority] = useState<Priority>(() =>
    (localStorage.getItem(STORAGE_KEY_PRIORITY) as Priority) || 'medium'
  );
  const [defaultCategory, setDefaultCategory] = useState<Category>(() =>
    (localStorage.getItem(STORAGE_KEY_CATEGORY) as Category) || 'other'
  );
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PRIORITY, defaultPriority);
  }, [defaultPriority]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CATEGORY, defaultCategory);
  }, [defaultCategory]);

  const handleClearAll = async () => {
    await db.tasks.clear();
    setShowClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">设置</h1>

      {/* 外观设置 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">外观</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">主题</p>
            <p className="text-xs text-gray-400 mt-0.5">深色模式即将推出</p>
          </div>
          <select
            disabled
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
          >
            <option>浅色</option>
            <option>深色</option>
          </select>
        </div>
      </div>

      {/* 默认值设置 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">默认值</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">默认优先级</label>
            <select
              value={defaultPriority}
              onChange={(e) => setDefaultPriority(e.target.value as Priority)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-700">默认分类</label>
            <select
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value as Category)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">数据管理</h2>
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            清空所有任务
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-600">确定要删除所有任务吗？此操作不可撤销</span>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
            >
              确认删除
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        )}
        {cleared && (
          <p className="text-sm text-green-600 mt-2">所有任务已清空</p>
        )}
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">关于</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>应用名称</span>
            <span className="text-gray-800 font-medium">Smart Todo</span>
          </div>
          <div className="flex justify-between">
            <span>版本</span>
            <span className="text-gray-800">0.1.0</span>
          </div>
          <div className="flex justify-between">
            <span>技术栈</span>
            <span className="text-gray-800">Tauri 2.0 + React + TypeScript</span>
          </div>
        </div>
      </div>
    </div>
  );
}
