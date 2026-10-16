import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  User, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { UserProfile } from '../types';
import { exportDataAsJSON } from '../services/storage';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onImportData: (importedData: any) => void;
  onResetData: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onImportData,
  onResetData,
}) => {
  const [userName, setUserName] = useState(profile.name);
  const [userTitle, setUserTitle] = useState(profile.title);
  const [weeklyTarget, setWeeklyTarget] = useState(profile.weeklyTargetHours);
  const [profileSaved, setProfileSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: userName.trim() || 'Pengguna',
      title: userTitle.trim() || 'Software Engineer',
      weeklyTargetHours: Number(weeklyTarget) || 15,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.skills && parsed.tasks) {
          onImportData(parsed);
          alert('Data berhasil diimpor!');
          onClose();
        } else {
          alert('Format file JSON tidak valid untuk data SkillTrack.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Pengaturan Profil & Cadangan Data
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Profil Pengguna */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-600" />
              <span>Profil Pengguna</span>
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Peran / Aspirasi
              </label>
              <input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Target Belajar Mingguan (Jam)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {profileSaved && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Profil tersimpan!</span>
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Simpan Profil
              </button>
            </div>
          </form>

          {/* Section 2: Cadangan & Ekspor Data */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Penyimpanan & Cadangan
            </h4>
            <p className="text-xs text-slate-500">
              Data Anda disimpan secara otomatis di peramban (LocalStorage). Anda dapat mengunduh salinan berkas JSON untuk dicadangkan atau dipindahkan ke komputer lain.
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={exportDataAsJSON}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Cadangan JSON</span>
              </button>

              <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-center">
                <Upload className="w-4 h-4" />
                <span>Pulihkan dari JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Section 3: Reset Data */}
          <div className="border-t border-slate-200 pt-5 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Zona Berbahaya</span>
            </h4>
            <p className="text-xs text-slate-500">
              Kembalikan seluruh data skill, tugas, dan refleksi ke dataset contoh bawaan.
            </p>
            <button
              type="button"
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mengatur ulang data ke kondisi awal? Data buatan Anda akan diganti.')) {
                  onResetData();
                  onClose();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Data Bawaan</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
