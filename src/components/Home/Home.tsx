import { Package, Target } from 'lucide-react';
import { Card } from '../UI/Card';

interface HomeProps {
  onNavigate: (view: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] md:min-h-[calc(100vh-12rem)] flex flex-col">
      <div className="relative h-[260px] md:h-[420px] w-full overflow-hidden rounded-xl shadow-2xl mb-8 md:mb-12 bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-3 drop-shadow-lg">
              K9 Operations Center
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 drop-shadow-md max-w-2xl">
              Professional canine unit management system for airport, port and border security
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto w-full px-4 md:px-0">
        <Card hover onClick={() => onNavigate('dashboard')}>
          <div className="p-8 md:p-10 lg:p-12 text-center group cursor-pointer">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Package size={40} className="text-amber-900 md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-3">
              Inventory
            </h2>
            <p className="text-stone-600 text-base md:text-lg">
              Manage dogs, handlers, officers, and facility operations
            </p>
          </div>
        </Card>

        <Card hover onClick={() => onNavigate('missions')} className="bg-amber-800 border-amber-900 shadow-lg hover:shadow-2xl">
          <div className="p-8 md:p-10 lg:p-12 text-center group cursor-pointer">
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Target size={40} className="text-white md:w-12 md:h-12" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
              Missions
            </h2>
            <p className="text-white/90 text-base md:text-lg">
              Create, schedule, and track daily field operations
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
