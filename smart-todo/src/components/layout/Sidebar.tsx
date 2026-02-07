import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '对话', icon: '💬' },
  { to: '/tasks', label: '任务列表', icon: '📋' },
  { to: '/inbox', label: '收集箱', icon: '📥' },
  { to: '/calendar', label: '日历', icon: '📅' },
  { to: '/analytics', label: '分析', icon: '📊' },
  { to: '/settings', label: '设置', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-60 h-screen bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="p-5 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">Smart Todo</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
