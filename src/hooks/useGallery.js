import { useState, useCallback } from 'react';

const STORAGE_KEY = 'memelab_gallery';

function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveGallery(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn('LocalStorage quota exceeded, gallery not persisted.');
  }
}

export function useGallery() {
  const [gallery, setGallery] = useState(loadGallery);

  const addToGallery = useCallback((dataUrl, label) => {
    const entry = {
      id: Date.now().toString(),
      url: dataUrl,
      name: label || `Mème #${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setGallery((prev) => {
      const next = [entry, ...prev];
      saveGallery(next);
      return next;
    });
    return entry.id;
  }, []);

  const removeFromGallery = useCallback((id) => {
    setGallery((prev) => {
      const next = prev.filter((m) => m.id !== id);
      saveGallery(next);
      return next;
    });
  }, []);

  const clearGallery = useCallback(() => {
    setGallery([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { gallery, addToGallery, removeFromGallery, clearGallery };
}
