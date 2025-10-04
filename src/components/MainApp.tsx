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
import { FitnessLogsTable } from './Fitness/FitnessLogsTable';
import { FitnessLogForm } from './Fitness/FitnessLogForm';
import { Dog, Handler, VetRecord, FitnessLog } from '../types/database';
import { supabase } from '../lib/supabase';

interface DogWithHandlers extends Dog {
  handlers?: Handler[];
}

interface VetRecordWithDog extends VetRecord {
  dog?: Dog;
}

interface FitnessLogWithDog extends FitnessLog {
  dog?: Dog;
}

export function MainApp() {
  const [activeView, setActiveView] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showDogForm, setShowDogForm] = useState(false);
  const [showDogDetails, setShowDogDetails] = useState(false);
  const [selectedDog, setSelectedDog] = useState<DogWithHandlers | null>(null);

  const [showHandlerForm, setShowHandlerForm] = useState(false);
  const [selectedHandler, setSelectedHandler] = useState<Handler | null>(null);

  const [showVetForm, setShowVetForm] = useState(false);
  const [selectedVetRecord, setSelectedVetRecord] = useState<VetRecord | null>(null);

  const [showFitnessForm, setShowFitnessForm] = useState(false);
  const [selectedFitnessLog, setSelectedFitnessLog] = useState<FitnessLog | null>(null);

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

  const handleEditFitnessLog = (log: FitnessLogWithDog) => {
    setSelectedFitnessLog(log);
    setShowFitnessForm(true);
  };

  const handleAddFitnessLog = () => {
    setSelectedFitnessLog(null);
    setShowFitnessForm(true);
  };

  const handleSaveFitnessLog = () => {
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="flex">
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 p-8">
          {activeView === 'dashboard' && <Dashboard onNavigate={setActiveView} />}

          {activeView === 'dogs' && (
            <DogTable
              onDogClick={handleDogClick}
              onAddClick={handleAddDog}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeView === 'handlers' && (
            <HandlersTable
              onAddClick={handleAddHandler}
              onEditClick={handleEditHandler}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeView === 'vet' && (
            <VetRecordsTable
              onAddClick={handleAddVetRecord}
              onEditClick={handleEditVetRecord}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeView === 'fitness' && (
            <FitnessLogsTable
              onAddClick={handleAddFitnessLog}
              onEditClick={handleEditFitnessLog}
              refreshTrigger={refreshTrigger}
            />
          )}
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

      <FitnessLogForm
        isOpen={showFitnessForm}
        onClose={() => {
          setShowFitnessForm(false);
          setSelectedFitnessLog(null);
        }}
        onSave={handleSaveFitnessLog}
        log={selectedFitnessLog}
      />
    </div>
  );
}
