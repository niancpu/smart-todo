import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '对话', icon: '💬' },
  { to: '/tasks', label: '任务', icon: '📋' },
  { to: '/inbox', label: '收集箱', icon: '📥' },
  { to: '/calendar', label: '日历', icon: '📅' },
  { to: '/settings', label: '设置', icon: '⚙️' },
];

export default function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
