import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { Camera, Plus, X, Image, ZoomIn, Trash2, Upload } from 'lucide-react';

interface PhotoGalleryProps {
  projectId: string;
  canEdit: boolean;
}

// Mock photos for UI demonstration - will be replaced with DB storage
const MOCK_PHOTOS: Record<string, { id: string; url: string; caption: string; uploadedBy: string; createdAt: string }[]> = {
  p1: [
    { id: 'ph1', url: 'https://placehold.co/800x600/0B1126/D4AF37?text=Stavební+připravenost', caption: 'Stavební připravenost - otvor pro vrata', uploadedBy: 'Petr Dvořák', createdAt: '2026-04-05' },
    { id: 'ph2', url: 'https://placehold.co/800x600/1a2744/D4AF37?text=Montáž+lišt', caption: 'Montáž vodících lišt', uploadedBy: 'Petr Dvořák', createdAt: '2026-04-07' },
  ],
  p3: [
    { id: 'ph3', url: 'https://placehold.co/800x600/0B1126/D4AF37?text=Průmyslový+otvor', caption: 'Otvor 4x4m pro průmyslová vrata', uploadedBy: 'Jana Svobodová', createdAt: '2026-04-03' },
  ],
};

export default function PhotoGallery({ projectId, canEdit }: PhotoGalleryProps) {
  const toast = useToast();
  const [photos, setPhotos] = useState(MOCK_PHOTOS[projectId] || []);
  const [viewPhoto, setViewPhoto] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    // When DB is connected: upload to server, store in attachments table
    // For now: show placeholder
    toast.info('Nahrávání fotek bude funkční po napojení databáze. UI je připravené.');
    setUploading(false);
  };

  const handleDelete = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    toast.success('Foto smazáno');
    setViewPhoto(null);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Camera size={16} className="text-brand-gold" /> Fotodokumentace ({photos.length})
        </h2>
        {canEdit && (
          <label className="btn-primary text-xs !py-1 !px-2.5 cursor-pointer">
            <Upload size={13} /> Nahrát foto
            <input type="file" accept="image/*" multiple className="hidden"
              onChange={() => handleUpload()} />
          </label>
        )}
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {photos.map(photo => (
            <div key={photo.id} className="relative group cursor-pointer rounded-xl overflow-hidden bg-gray-100 aspect-[4/3]"
              onClick={() => setViewPhoto(photo)}>
              <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-[10px] font-medium truncate">{photo.caption}</p>
              </div>
            </div>
          ))}

          {/* Upload placeholder */}
          {canEdit && (
            <label className="cursor-pointer rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-gold/50 bg-gray-50 hover:bg-brand-gold/5 aspect-[4/3] flex flex-col items-center justify-center gap-1.5 transition-colors">
              <Plus size={20} className="text-gray-400" />
              <span className="text-[10px] text-gray-400">Přidat foto</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={() => handleUpload()} />
            </label>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Image size={36} className="mx-auto mb-2 text-gray-300" />
          <p className="text-xs text-gray-400 mb-2">Žádné fotky</p>
          {canEdit && (
            <label className="btn-secondary text-xs cursor-pointer inline-flex">
              <Camera size={13} /> Nahrát první foto
              <input type="file" accept="image/*" multiple className="hidden" onChange={() => handleUpload()} />
            </label>
          )}
        </div>
      )}

      {/* Lightbox */}
      {viewPhoto && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setViewPhoto(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-white font-medium">{viewPhoto.caption}</p>
                <p className="text-gray-400 text-xs">{viewPhoto.uploadedBy} · {new Date(viewPhoto.createdAt).toLocaleDateString('cs-CZ')}</p>
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button onClick={() => handleDelete(viewPhoto.id)} className="p-2 rounded-lg bg-white/10 hover:bg-red-500/20 text-white hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={() => setViewPhoto(null)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            <img src={viewPhoto.url} alt={viewPhoto.caption} className="w-full rounded-xl max-h-[75vh] object-contain bg-black" />
          </div>
        </div>
      )}
    </div>
  );
}
