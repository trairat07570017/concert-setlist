import React, { useState } from 'react';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { SongInput, COMMON_KEYS } from '../../domain/song';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: SongInput) => Promise<void>;
}

export const AddSongModal: React.FC<AddSongModalProps> = ({
  isOpen,
  onClose,
  onAddSong
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [originalKey, setOriginalKey] = useState('C');
  const [playKey, setPlayKey] = useState('C');
  const [tempoBpm, setTempoBpm] = useState<string>('');
  const [versionUrl, setVersionUrl] = useState('');
  const [chordUrl, setChordUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุชื่อเพลง');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddSong({
        title: title.trim(),
        artist: artist.trim(),
        originalKey,
        playKey: playKey || originalKey,
        tempoBpm: tempoBpm ? parseInt(tempoBpm, 10) : null,
        versionUrl: versionUrl.trim(),
        chordUrl: chordUrl.trim(),
        chordContent: '',
        notes: notes.trim()
      });

      // Reset form
      setTitle('');
      setArtist('');
      setOriginalKey('C');
      setPlayKey('C');
      setTempoBpm('');
      setVersionUrl('');
      setChordUrl('');
      setNotes('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกเพลง');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="เพิ่มเพลงเข้า Setlist" maxWidth="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              ชื่อเพลง <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น วัดปะหล่ะ?, ทรงอย่างแบด"
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              ศิลปิน / วงดนตรี
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="เช่น 4EVE, Paper Planes"
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              คีย์ต้นฉบับ (Original)
            </label>
            <select
              value={originalKey}
              onChange={(e) => {
                setOriginalKey(e.target.value);
                if (!playKey || playKey === originalKey) {
                  setPlayKey(e.target.value);
                }
              }}
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            >
              {COMMON_KEYS.map((k) => (
                <option key={`orig-${k}`} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
              คีย์ที่วงเล่นจริง (Play Key) ⭐️
            </label>
            <select
              value={playKey}
              onChange={(e) => setPlayKey(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-rose-500/50 rounded-xl text-rose-300 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            >
              {COMMON_KEYS.map((k) => (
                <option key={`play-${k}`} value={k}>
                  Key {k}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              ความเร็ว (BPM)
            </label>
            <input
              type="number"
              min="40"
              max="260"
              value={tempoBpm}
              onChange={(e) => setTempoBpm(e.target.value)}
              placeholder="เช่น 120"
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              ลิงก์คอร์ด (Chordzaa / DoChord)
            </label>
            <input
              type="url"
              value={chordUrl}
              onChange={(e) => setChordUrl(e.target.value)}
              placeholder="เช่น https://www.chordzaa.com/easy-chord/3101/"
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              ลิงก์เวอร์ชันซ้อม (YouTube / Spotify)
            </label>
            <input
              type="url"
              value={versionUrl}
              onChange={(e) => setVersionUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              โน้ต / บันทึกการเล่นของวง
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น กลองเคาะนำ 4 จังหวะ, กีตาร์ขึ้น Solo ก่อน, จบแบบ Fade-out"
              className="w-full px-3.5 py-2.5 bg-zinc-800/80 border border-zinc-700/60 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มเพลง'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
