'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Members & Dues', href: '/members', icon: '👥' },
  { name: 'Payments', href: '/payments', icon: '💳' },
  { name: 'Reimbursements', href: '/reimbursements', icon: '🧾' },
  { name: 'Events', href: '/events', icon: '🎉' },
  { name: 'Cash Flow', href: '/cashflow', icon: '💰' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Scenario Planner', href: '/scenarios', icon: '🎯' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gradient-to-b from-primary-800 to-primary-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">GreekLedger</h1>
        <p className="text-primary-200 text-sm mt-1">Finance Command Center</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-100 hover:bg-primary-700/50'
              }`}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-primary-700">
        <p className="text-xs text-primary-300">
          © 2024 GreekLedger
        </p>
      </div>
    </div>
  );
}

