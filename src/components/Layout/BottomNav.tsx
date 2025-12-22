import { LayoutDashboard, Dog, Target, Users, Activity } from 'lucide-react';

interface BottomNavProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

export function BottomNav({ activeView, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'missions', label: 'Missions', icon: Target },
    { id: 'dogs', label: 'Dogs', icon: Dog },
    { id: 'handlers', label: 'Handlers', icon: Users },
    { id: 'fitness', label: 'Fitness', icon: Activity },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 md:hidden z-40">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-amber-900'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              <Icon size={22} className={`mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
