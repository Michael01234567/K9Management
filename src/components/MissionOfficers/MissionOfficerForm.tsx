import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { supabase } from '../../lib/supabase';
import { MissionOfficer } from '../../types/database';

interface MissionOfficerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  officer?: MissionOfficer | null;
}

export function MissionOfficerForm({ isOpen, onClose, onSave, officer }: MissionOfficerFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    email: '',
    phone: '',
    picture_url: '',
  });
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  useEffect(() => {
    if (officer) {
      setFormData({
        employee_id: officer.employee_id,
        full_name: officer.full_name,
        email: officer.email || '',
        phone: officer.phone || '',
        picture_url: officer.picture_url || '',
      });
      setPicturePreview(officer.picture_url);
    } else {
      setFormData({
        employee_id: '',
        full_name: '',
        email: '',
        phone: '',
        picture_url: '',
      });
      setPicturePreview(null);
    }
    setPictureFile(null);
  }, [officer, isOpen]);

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

  const uploadPicture = async (officerId: string): Promise<string | null> => {
    if (!pictureFile) return formData.picture_url || null;

    const fileExt = pictureFile.name.split('.').pop();
    const fileName = `${officerId}-${Date.now()}.${fileExt}`;

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
      let officerId = officer?.id;
      let pictureUrl = formData.picture_url;

      if (officer) {
        if (pictureFile) {
          pictureUrl = await uploadPicture(officer.id) || '';
        }
        const { error } = await supabase
          .from('mission_officers')
          .update({ ...formData, picture_url: pictureUrl })
          .eq('id', officer.id);
        if (error) throw error;
      } else {
        const { data: newOfficer, error: insertError } = await supabase
          .from('mission_officers')
          .insert({ ...formData, picture_url: '' })
          .select()
          .single();
        if (insertError) throw insertError;
        officerId = newOfficer.id;

        if (pictureFile && officerId) {
          pictureUrl = await uploadPicture(officerId) || '';
          const { error: updateError } = await supabase
            .from('mission_officers')
            .update({ picture_url: pictureUrl })
            .eq('id', officerId);
          if (updateError) throw updateError;
        }
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving mission officer:', error);
      alert('Error saving mission officer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!officer || !confirm('Are you sure you want to delete this mission officer?')) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('mission_officers').delete().eq('id', officer.id);
      if (error) throw error;
      onSave();
      onClose();
    } catch (error) {
      console.error('Error deleting mission officer:', error);
      alert('Error deleting mission officer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={officer ? 'Edit Mission Officer' : 'Add New Mission Officer'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            {picturePreview ? (
              <div className="relative">
                <img
                  src={picturePreview}
                  alt="Officer preview"
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
          placeholder="ICP-FCA 001"
          disabled={!!officer}
        />
        <Input
          label="Full Name *"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
          placeholder="Ahmed Al Mansoori"
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="officer@icpk9.ae"
        />
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+971 50 123 4567"
        />

        <div className="flex gap-4 justify-between">
          <div>
            {officer && (
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
              {loading ? 'Saving...' : officer ? 'Update' : 'Add Officer'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
