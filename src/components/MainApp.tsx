import { useState, lazy, Suspense } from 'react';
import { Navbar } from './Layout/Navbar';
import { Sidebar } from './Layout/Sidebar';
import { BottomNav } from './Layout/BottomNav';
import { Home } from './Home/Home';
import { DogDetailsModal } from './Dogs/DogDetailsModal';
import { DogForm } from './Dogs/DogForm';
import { HandlerForm } from './Handlers/HandlerForm';
import { MissionOfficerForm } from './MissionOfficers/MissionOfficerForm';
import { VetRecordForm } from './Vet/VetRecordForm';
import { AppLoader } from './UI/AppLoader';
import { Dog, Handler, MissionOfficer, VetRecord } from '../types/database';
import { supabase } from '../lib/supabase';

const Dashboard = lazy(() => import('./Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const DogTable = lazy(() => import('./Dogs/DogTable').then(m => ({ default: m.DogTable })));
const HandlersTable = lazy(() => import('./Handlers/HandlersTable').then(m => ({ default: m.HandlersTable })));
const MissionOfficersTable = lazy(() => import('./MissionOfficers/MissionOfficersTable').then(m => ({ default: m.MissionOfficersTable })));
const VetRecordsTable = lazy(() => import('./Vet/VetRecordsTable').then(m => ({ default: m.VetRecordsTable })));
const FitnessStatusTable = lazy(() => import('./Fitness/FitnessStatusTable').then(m => ({ default: m.FitnessStatusTable })));
const Missions = lazy(() => import('./Missions/Missions').then(m => ({ default: m.Missions })));
const Locations = lazy(() => import('./Locations/Locations'));
const MissionLocations = lazy(() => import('./MissionLocations/MissionLocations'));
const ReportsAnalytics = lazy(() => import('./Reports/ReportsAnalytics').then(m => ({ default: m.ReportsAnalytics })));

interface DogWithHandlers extends Dog {
  handlers?: Handler[];
}

interface VetRecordWithDog extends VetRecord {
  dog?: Dog;
}

export function MainApp() {
  const [activeView, setActiveView] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showDogForm, setShowDogForm] = useState(false);
  const [showDogDetails, setShowDogDetails] = useState(false);
  const [selectedDog, setSelectedDog] = useState<DogWithHandlers | null>(null);

  const [showHandlerForm, setShowHandlerForm] = useState(false);
  const [selectedHandler, setSelectedHandler] = useState<Handler | null>(null);

  const [showMissionOfficerForm, setShowMissionOfficerForm] = useState(false);
  const [selectedMissionOfficer, setSelectedMissionOfficer] = useState<MissionOfficer | null>(null);

  const [showVetForm, setShowVetForm] = useState(false);
  const [selectedVetRecord, setSelectedVetRecord] = useState<VetRecord | null>(null);


  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDogClick = (dog: DogWithHandlers) => {
    setSelectedDog(dog);
    setShowDogDetails(true);
  };

  const handleEditDog = (dog: DogWithHandlers) => {
    setSelectedDog(dog);
    setShowDogDetails(false);
    setShowDogForm(true);
  };

  const handleDeleteDog = async (dogId: string) => {
    try {
      await supabase.from('dogs').delete().eq('id', dogId);
      handleRefresh();
    } catch (error) {
      console.error('Error deleting dog:', error);
    }
  };

  const handleAddDog = () => {
    setSelectedDog(null);
    setShowDogForm(true);
  };

  const handleSaveDog = () => {
    handleRefresh();
  };

  const handleEditHandler = (handler: Handler) => {
    setSelectedHandler(handler);
    setShowHandlerForm(true);
  };

  const handleAddHandler = () => {
    setSelectedHandler(null);
    setShowHandlerForm(true);
  };

  const handleSaveHandler = () => {
    handleRefresh();
  };

  const handleEditMissionOfficer = (officer: MissionOfficer) => {
    setSelectedMissionOfficer(officer);
    setShowMissionOfficerForm(true);
  };

  const handleAddMissionOfficer = () => {
    setSelectedMissionOfficer(null);
    setShowMissionOfficerForm(true);
  };

  const handleSaveMissionOfficer = () => {
    handleRefresh();
  };

  const handleEditVetRecord = (record: VetRecordWithDog) => {
    setSelectedVetRecord(record);
    setShowVetForm(true);
  };

  const handleAddVetRecord = () => {
    setSelectedVetRecord(null);
    setShowVetForm(true);
  };

  const handleSaveVetRecord = () => {
    handleRefresh();
  };

  const showSidebar = activeView !== 'home';
  const showNavbar = activeView !== 'home';

  return (
    <div className="min-h-screen bg-stone-50">
      {showNavbar && (
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          onHomeClick={() => setActiveView('home')}
        />
      )}
      <div className="flex">
        {showSidebar && (
          <Sidebar
            activeView={activeView}
            onNavigate={setActiveView}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main className={`flex-1 w-full ${activeView === 'home' ? 'p-4 md:p-8 lg:p-12' : 'p-4 md:p-6 lg:p-8'}`}>
          <Suspense fallback={<AppLoader />}>
            {activeView === 'home' && <Home onNavigate={setActiveView} />}
            {activeView === 'dashboard' && <Dashboard onNavigate={setActiveView} />}

            {activeView === 'dogs' && (
              <DogTable
                onDogClick={handleDogClick}
                onAddClick={handleAddDog}
                refreshTrigger={refreshTrigger}
                onReturn={() => setActiveView('dashboard')}
              />
            )}

            {activeView === 'handlers' && (
              <HandlersTable
                onAddClick={handleAddHandler}
                onEditClick={handleEditHandler}
                refreshTrigger={refreshTrigger}
                onReturn={() => setActiveView('dashboard')}
              />
            )}

            {activeView === 'mission-officers' && (
              <MissionOfficersTable
                onAddClick={handleAddMissionOfficer}
                onEditClick={handleEditMissionOfficer}
                refreshTrigger={refreshTrigger}
                onReturn={() => setActiveView('dashboard')}
              />
            )}

            {activeView === 'vet' && (
              <VetRecordsTable
                onAddClick={handleAddVetRecord}
                onEditClick={handleEditVetRecord}
                refreshTrigger={refreshTrigger}
                onReturn={() => setActiveView('dashboard')}
              />
            )}

            {activeView === 'fitness' && <FitnessStatusTable onReturn={() => setActiveView('dashboard')} />}

            {activeView === 'missions' && <Missions />}

            {activeView === 'reports' && <ReportsAnalytics />}

            {activeView === 'locations' && <Locations />}

            {activeView === 'mission-locations' && <MissionLocations />}
          </Suspense>
        </main>
      </div>

      {activeView !== 'home' && <BottomNav activeView={activeView} onNavigate={setActiveView} />}

      <DogDetailsModal
        isOpen={showDogDetails}
        onClose={() => setShowDogDetails(false)}
        dog={selectedDog}
        onEdit={handleEditDog}
        onDelete={handleDeleteDog}
      />

      <DogForm
        isOpen={showDogForm}
        onClose={() => {
          setShowDogForm(false);
          setSelectedDog(null);
        }}
        onSave={handleSaveDog}
        dog={selectedDog}
      />

      <HandlerForm
        isOpen={showHandlerForm}
        onClose={() => {
          setShowHandlerForm(false);
          setSelectedHandler(null);
        }}
        onSave={handleSaveHandler}
        handler={selectedHandler}
      />

      <MissionOfficerForm
        isOpen={showMissionOfficerForm}
        onClose={() => {
          setShowMissionOfficerForm(false);
          setSelectedMissionOfficer(null);
        }}
        onSave={handleSaveMissionOfficer}
        officer={selectedMissionOfficer}
      />

      <VetRecordForm
        isOpen={showVetForm}
        onClose={() => {
          setShowVetForm(false);
          setSelectedVetRecord(null);
        }}
        onSave={handleSaveVetRecord}
        record={selectedVetRecord}
      />
    </div>
  );
}
