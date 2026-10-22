import React, { useState, useEffect } from 'react';
import { Song, SongInput } from '../../domain/song';
import { SongRepository } from '../../repositories/song-repository';
import { SongCard } from './SongCard';
import { AddSongModal } from './AddSongModal';
import { EditSongModal } from './EditSongModal';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { Plus, Music2, RefreshCw, ListMusic, AlertTriangle } from 'lucide-react';

interface SetlistViewProps {
  repository: SongRepository;
  onOpenStageMode?: () => void;
  onSelectChordSong?: (song: Song) => void;
}

export const SetlistView: React.FC<SetlistViewProps> = ({
  repository,
  onSelectChordSong
}) => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop state
  const [dragItemIndex, setDragItemIndex] = useState<number | null>(null);

  const loadSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await repository.getSongs();
      setSongs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถโหลดลิสต์เพลงได้');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSongs();
  }, []);

  const handleAddSong = async (songInput: SongInput) => {
    await repository.saveSong(songInput);
    await loadSongs();
  };

  const handleUpdateSong = async (id: string, updates: Partial<SongInput>) => {
    await repository.updateSong(id, updates);
    await loadSongs();
  };

  const handleDeleteSong = async () => {
    if (!deletingSong) return;
    try {
      await repository.deleteSong(deletingSong.id);
      setDeletingSong(null);
      await loadSongs();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบเพลง');
    }
  };

  const handleMove = async (currentIndex: number, targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= songs.length) return;
    const newSongs = [...songs];
    const [moved] = newSongs.splice(currentIndex, 1);
    newSongs.splice(targetIndex, 0, moved);

    // Optimistic UI update
    setSongs(newSongs);

    try {
      await repository.reorderSongs(newSongs.map((s) => s.id));
    } catch (err: unknown) {
      setError('ไม่สามารถบันทึกลำดับเพลงใหม่ได้');
      await loadSongs();
    }
  };

  // Drag & drop handlers
  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDragItemIndex(index);
  };

  const handleDragEnter = (_e: React.DragEvent, targetIndex: number) => {
    if (dragItemIndex === null || dragItemIndex === targetIndex) return;
    const newSongs = [...songs];
    const [dragged] = newSongs.splice(dragItemIndex, 1);
    newSongs.splice(targetIndex, 0, dragged);
    setDragItemIndex(targetIndex);
    setSongs(newSongs);
  };

  const handleDragEnd = async () => {
    setDragItemIndex(null);
    try {
      await repository.reorderSongs(songs.map((s) => s.id));
    } catch {
      await loadSongs();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 sm:p-5 rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
              ลำดับเพลงแสดงคอนเสิร์ต
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700/60">
                {songs.length} เพลง
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              ลากสลับลำดับเพลงได้ • ระบุคีย์และเวอร์ชันซ้อมให้คนในวงรู้ทันที
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadSongs}
            disabled={isLoading}
            className="text-zinc-400 hover:text-zinc-200"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            เพิ่มเพลง
          </Button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={loadSongs}>
            ลองใหม่
          </Button>
        </div>
      )}

      {/* Songs list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-zinc-900/50 rounded-2xl animate-pulse border border-zinc-800/40" />
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-zinc-900/40 border border-zinc-800/60 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
            <Music2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-200">ยังไม่มีเพลงใน Setlist</h3>
            <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
              เริ่มต้นด้วยการเพิ่มเพลงแรกของวง พร้อมระบุคีย์และลิงก์สำหรับซ้อม
            </p>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" />
            เพิ่มเพลงแรก
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {songs.map((song, index) => (
            <SongCard
              key={song.id}
              song={song}
              index={index}
              totalSongs={songs.length}
              isDragging={dragItemIndex === index}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragEnd={handleDragEnd}
              onMoveUp={(idx) => handleMove(idx, idx - 1)}
              onMoveDown={(idx) => handleMove(idx, idx + 1)}
              onEdit={(s) => setEditingSong(s)}
              onDelete={(s) => setDeletingSong(s)}
              onOpenChord={(s) => onSelectChordSong && onSelectChordSong(s)}
            />
          ))}
        </div>
      )}

      {/* Add song modal */}
      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSong={handleAddSong}
      />

      {/* Edit song modal */}
      <EditSongModal
        isOpen={Boolean(editingSong)}
        song={editingSong}
        onClose={() => setEditingSong(null)}
        onUpdateSong={handleUpdateSong}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingSong)}
        onClose={() => setDeletingSong(null)}
        title="ยืนยันการลบเพลง"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <p className="text-sm">
              คุณต้องการลบเพลง <span className="font-bold text-white">"{deletingSong?.title}"</span> ออกจาก Setlist หรือไม่?
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeletingSong(null)}>
              ยกเลิก
            </Button>
            <Button variant="danger" onClick={handleDeleteSong}>
              ลบเพลงนี้
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
