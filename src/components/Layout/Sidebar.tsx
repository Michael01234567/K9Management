import { LayoutDashboard, Dog, Users, Calendar, Activity } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dogs', label: 'Dogs', icon: Dog },
    { id: 'handlers', label: 'Handlers', icon: Users },
    { id: 'vet', label: 'Vet Records', icon: Calendar },
    { id: 'fitness', label: 'Fitness', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-white border-r border-stone-200 min-h-[calc(100vh-73px)]">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-amber-900 text-white shadow-md'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
