import { useState } from 'react';
import { LogOut, Menu, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';

interface NavbarProps {
  onMenuClick: () => void;
  onHomeClick?: () => void;
}

export function Navbar({ onMenuClick, onHomeClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  return (
    <nav className="bg-amber-900 text-white shadow-lg">
      <div className="px-4 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-amber-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={onHomeClick}
              className="hidden md:flex p-2 hover:bg-amber-800 rounded-lg transition-colors"
              aria-label="Go to home"
            >
              <Home size={24} />
            </button>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-white shadow-md">
              <img
                src="/icons/icon-96x96.png"
                alt="K9 Management"
                className="w-full h-full object-cover"
              />
            </div>
            <button onClick={onHomeClick} className="min-w-0 flex-1 text-left group">
              <h1 className="text-base md:text-xl font-bold truncate group-hover:text-amber-100 transition-colors">
                Michael K9 Management
              </h1>
              <p className="text-xs text-amber-100 hidden sm:block group-hover:text-white transition-colors">
                Teams, Missions & Care
              </p>
            </button>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-white">
                Hi {user?.user_metadata?.full_name || 'User'}
              </span>
              <span className="text-xs text-amber-200">
                {user?.user_metadata?.role || 'Role Unknown'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSignOutConfirm(true)}
              className="text-white hover:bg-amber-800 p-2 md:px-3 md:py-2"
            >
              <LogOut size={18} className="md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        title="Confirm Sign Out"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-stone-700 text-base leading-relaxed">
            Are you sure you want to sign out? You will need to log in again to continue.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowSignOutConfirm(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowSignOutConfirm(false);
                signOut();
              }}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </nav>
  );
}
