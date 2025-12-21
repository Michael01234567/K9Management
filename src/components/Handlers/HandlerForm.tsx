import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { supabase } from '../../lib/supabase';
import { Handler } from '../../types/database';

interface HandlerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  handler?: Handler | null;
}

export function HandlerForm({ isOpen, onClose, onSave, handler }: HandlerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    picture_url: '',
    team_leader: false,
    driver: false,
  });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (handler) {
      setFormData({
        employee_id: handler.employee_id,
        full_name: handler.full_name,
        email: handler.email || '',
        phone: handler.phone || '',
        picture_url: handler.picture_url || '',
        team_leader: handler.team_leader || false,
        driver: handler.driver || false,
      });
      setPicturePreview(handler.picture_url);
    } else {
      loadNextEmployeeId();
      setFormData({
        employee_id: '',
        full_name: '',
        email: '',
        phone: '',
        picture_url: '',
        team_leader: false,
        driver: false,
      });
      setPicturePreview(null);
    }
    setPictureFile(null);
  }, [handler, isOpen]);

  const loadNextEmployeeId = async () => {
    try {
      const { data, error } = await supabase
        .from('handlers')
        .select('employee_id')
        .order('employee_id', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        const lastId = parseInt(data.employee_id);
        const nextId = (lastId + 1).toString();
        setFormData(prev => ({ ...prev, employee_id: nextId }));
      } else {
        setFormData(prev => ({ ...prev, employee_id: '150101' }));
      }
    } catch (error) {
      setFormData(prev => ({ ...prev, employee_id: '150101' }));
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setPictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePicture = () => {
    setPictureFile(null);
    setPicturePreview(null);
    setFormData({ ...formData, picture_url: '' });
  };

  const uploadPicture = async (handlerId: string): Promise<string | null> => {
    if (!pictureFile) return formData.picture_url || null;

    const fileExt = pictureFile.name.split('.').pop();
    const fileName = `${handlerId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('handler-pictures')
      .upload(fileName, pictureFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('handler-pictures')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let handlerId = handler?.id;
      let pictureUrl = formData.picture_url;

      if (handler) {
        if (pictureFile) {
          pictureUrl = await uploadPicture(handler.id) || '';
        }
        const { error } = await supabase
          .from('handlers')
          .update({ ...formData, picture_url: pictureUrl })
          .eq('id', handler.id);
        if (error) throw error;
      } else {
        const { data: newHandler, error: insertError } = await supabase
          .from('handlers')
          .insert({ ...formData, picture_url: '' })
          .select()
          .single();
        if (insertError) throw insertError;
        handlerId = newHandler.id;

        if (pictureFile) {
          pictureUrl = await uploadPicture(handlerId) || '';
          const { error: updateError } = await supabase
            .from('handlers')
            .update({ picture_url: pictureUrl })
            .eq('id', handlerId);
          if (updateError) throw updateError;
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving handler:', error);
      alert('Error saving handler. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!handler || !confirm('Are you sure you want to delete this handler?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('handlers').delete().eq('id', handler.id);
      if (error) throw error;
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting handler:', error);
      alert('Error deleting handler. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={handler ? 'Edit Handler' : 'Add New Handler'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            {picturePreview ? (
              <div className="relative">
                <img
                  src={picturePreview}
                  alt="Handler preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-stone-200"
                />
                <button
                  type="button"
                  onClick={handleRemovePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center border-2 border-dashed border-stone-300">
                <Upload size={32} className="text-stone-400" />
              </div>
            )}
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureChange}
                className="hidden"
                id="picture-upload"
              />
              <label
                htmlFor="picture-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-stone-300 rounded-lg shadow-sm text-sm font-medium text-stone-700 bg-white hover:bg-stone-50 transition-colors"
              >
                <Upload size={16} className="mr-2" />
                {picturePreview ? 'Change Picture' : 'Upload Picture'}
              </label>
              <p className="text-xs text-stone-500 mt-2">Max size: 5MB</p>
            </div>
          </div>
        </div>

        <Input
          label="Employee ID *"
          value={formData.employee_id}
          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
          required
          placeholder="150101"
          disabled={!!handler}
        />
        <Input
          label="Full Name *"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
          placeholder="John Doe"
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="handler@k9unit.com"
        />
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
        />

        <div className="space-y-4">
          <label className="block text-sm font-medium text-stone-700 mb-2">Roles</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.team_leader}
                onChange={(e) => setFormData({ ...formData, team_leader: e.target.checked })}
                className="w-4 h-4 text-amber-600 bg-stone-100 border-stone-300 rounded focus:ring-amber-500 focus:ring-2"
              />
              <span className="text-sm text-stone-700">Team Leader</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.driver}
                onChange={(e) => setFormData({ ...formData, driver: e.target.checked })}
                className="w-4 h-4 text-amber-600 bg-stone-100 border-stone-300 rounded focus:ring-amber-500 focus:ring-2"
              />
              <span className="text-sm text-stone-700">Driver</span>
            </label>
          </div>
        </div>

        <div className="flex gap-4 justify-between">
          <div>
            {handler && (
              <Button type="button" variant="danger" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : handler ? 'Update' : 'Add Handler'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
