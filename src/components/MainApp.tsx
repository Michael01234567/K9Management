import { useState } from 'react';
import { Navbar } from './Layout/Navbar';
import { Sidebar } from './Layout/Sidebar';
import { Dashboard } from './Dashboard/Dashboard';
import { DogTable } from './Dogs/DogTable';
import { DogDetailsModal } from './Dogs/DogDetailsModal';
import { DogForm } from './Dogs/DogForm';
import { HandlersTable } from './Handlers/HandlersTable';
import { HandlerForm } from './Handlers/HandlerForm';
import { VetRecordsTable } from './Vet/VetRecordsTable';
import { VetRecordForm } from './Vet/VetRecordForm';
import { FitnessStatusTable } from './Fitness/FitnessStatusTable';
import Locations from './Locations/Locations';
import { Dog, Handler, VetRecord } from '../types/database';
import { supabase } from '../lib/supabase';

interface DogWithHandlers extends Dog {
  handlers?: Handler[];
}

interface VetRecordWithDog extends VetRecord {
  dog?: Dog;
}

export function MainApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [showDogForm, setShowDogForm] = useState(false);
  const [showDogDetails, setShowDogDetails] = useState(false);
  const [selectedDog, setSelectedDog] = useState<DogWithHandlers | null>(null);

  const [showHandlerForm, setShowHandlerForm] = useState(false);
  const [selectedHandler, setSelectedHandler] = useState<Handler | null>(null);

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

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar
          activeView={activeView}
          onNavigate={setActiveView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8 w-full">
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

          {activeView === 'vet' && (
            <VetRecordsTable
              onAddClick={handleAddVetRecord}
              onEditClick={handleEditVetRecord}
              refreshTrigger={refreshTrigger}
              onReturn={() => setActiveView('dashboard')}
            />
          )}

          {activeView === 'fitness' && <FitnessStatusTable onReturn={() => setActiveView('dashboard')} />}

          {activeView === 'locations' && <Locations />}
        </main>
      </div>

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
