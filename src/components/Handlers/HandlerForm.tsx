import React, { useState, useEffect } from 'react';
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
    full_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (handler) {
      setFormData({
        full_name: handler.full_name,
        email: handler.email || '',
        phone: handler.phone || '',
      });
    } else {
      setFormData({
        full_name: '',
        email: '',
        phone: '',
      });
    }
  }, [handler, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (handler) {
        const { error } = await supabase.from('handlers').update(formData).eq('id', handler.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('handlers').insert(formData);
        if (error) throw error;
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
