import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../UI/Button';

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-amber-900 text-white shadow-lg">
      <div className="px-3 py-3 sm:px-4 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2.5 hover:bg-amber-800 rounded-lg transition-colors active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg md:text-xl font-bold truncate leading-tight">Michael K9 Management</h1>
              <p className="text-xs text-amber-100 hidden sm:block leading-tight mt-0.5">Dog Inventory & Care</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs md:text-sm text-amber-100 hidden md:inline truncate max-w-[120px] lg:max-w-[150px]">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-white hover:bg-amber-800 active:scale-95 min-w-[44px] min-h-[44px] p-2 sm:px-3 sm:py-2"
            >
              <LogOut size={20} className="md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
