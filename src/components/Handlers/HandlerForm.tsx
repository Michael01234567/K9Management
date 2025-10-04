import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Upload, X, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Handler } from '../../types/database';
import { uploadHandlerImage, deleteHandlerImage, validateImageFile } from '../../utils/imageUpload';

interface HandlerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  handler?: Handler | null;
}

export function HandlerForm({ isOpen, onClose, onSave, handler }: HandlerFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    picture_url: '',
  });

  useEffect(() => {
    if (handler) {
      setFormData({
        full_name: handler.full_name,
        email: handler.email || '',
        phone: handler.phone || '',
        picture_url: handler.picture_url || '',
      });
      setImagePreview(handler.picture_url || null);
      setImageFile(null);
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        picture_url: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
  }, [handler, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      alert(error);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData({ ...formData, picture_url: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let pictureUrl = formData.picture_url;

      if (handler) {
        if (imageFile) {
          if (handler.picture_url) {
            await deleteHandlerImage(handler.picture_url);
          }
          pictureUrl = await uploadHandlerImage(imageFile, handler.id);
        } else if (!imagePreview) {
          if (handler.picture_url) {
            await deleteHandlerImage(handler.picture_url);
          }
          pictureUrl = '';
        }

        const { error } = await supabase
          .from('handlers')
          .update({ ...formData, picture_url: pictureUrl })
          .eq('id', handler.id);
        if (error) throw error;
      } else {
        const { data: newHandler, error: insertError } = await supabase
          .from('handlers')
          .insert(formData)
          .select()
          .single();

        if (insertError) throw insertError;

        if (imageFile && newHandler) {
          pictureUrl = await uploadHandlerImage(imageFile, newHandler.id);
          const { error: updateError } = await supabase
            .from('handlers')
            .update({ picture_url: pictureUrl })
            .eq('id', newHandler.id);
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
      if (handler.picture_url) {
        await deleteHandlerImage(handler.picture_url);
      }
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
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden border-2 border-stone-200">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Handler preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} className="text-stone-400" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
                <div className="inline-flex items-center px-4 py-2 bg-amber-900 text-white rounded-lg hover:bg-amber-800 transition-colors">
                  <Upload size={16} className="mr-2" />
                  {imagePreview ? 'Change Picture' : 'Upload Picture'}
                </div>
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  <X size={16} className="mr-2" />
                  Remove Picture
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-2">Accepted: JPG, PNG, GIF, WebP (Max 5MB)</p>
        </div>

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
