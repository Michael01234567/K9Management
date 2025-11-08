import { LayoutDashboard, Dog, Users, Calendar, Activity, MapPin, Target, X } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onNavigate, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'dogs', label: 'Dogs', icon: Dog },
    { id: 'handlers', label: 'Handlers', icon: Users },
    { id: 'vet', label: 'Vet Records', icon: Calendar },
    { id: 'fitness', label: 'Fitness', icon: Activity },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'mission-locations', label: 'Mission Locations', icon: Target },
  ];

  const handleNavigate = (view: string) => {
    onNavigate(view);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 z-50
          w-[280px] sm:w-64 bg-white border-r border-stone-200
          min-h-screen lg:min-h-[calc(100vh-73px)]
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-lg transition-all duration-150 min-h-[48px] active:scale-98 ${
                  isActive
                    ? 'bg-amber-900 text-white shadow-md'
                    : 'text-stone-700 hover:bg-stone-100 active:bg-stone-200'
                }`}
              >
                <Icon size={22} className="flex-shrink-0" />
                <span className="font-medium text-base">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
