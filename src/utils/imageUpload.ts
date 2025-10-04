import { supabase } from '../lib/supabase';

export async function uploadHandlerImage(file: File, handlerId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${handlerId}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('handler-pictures')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('handler-pictures')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteHandlerImage(pictureUrl: string): Promise<void> {
  if (!pictureUrl) return;

  const fileName = pictureUrl.split('/').pop();
  if (!fileName) return;

  const { error } = await supabase.storage
    .from('handler-pictures')
    .remove([fileName]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}

export function validateImageFile(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)';
  }

  if (file.size > maxSize) {
    return 'Image size must be less than 5MB';
  }

  return null;
}
