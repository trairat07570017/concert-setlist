import React from 'react';
import { Song } from '../../domain/song';
import { Badge } from '../../components/ui/badge';
import { Music, Play, FileText, Clock, Key, GripVertical, ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';

interface SongCardProps {
  song: Song;
  index: number;
  totalSongs: number;
  onEdit: (song: Song) => void;
  onDelete: (song: Song) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  onOpenChord?: (song: Song) => void;
  onOpenVideo?: (song: Song) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragEnter?: (e: React.DragEvent, index: number) => void;
  onDragEnd?: () => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  index,
  totalSongs,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenChord,
  onOpenVideo,
  isDragging,
  onDragStart,
  onDragEnter,
  onDragEnd
}) => {
  const isKeyTransposed = song.playKey && song.originalKey && song.playKey !== song.originalKey;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter && onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`group relative bg-zinc-900/90 hover:bg-zinc-850 border rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg shadow-black/20 ${
        isDragging
          ? 'opacity-40 border-rose-500 scale-[0.98]'
          : 'border-zinc-800/80 hover:border-zinc-700/80'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left side: Drag handle, Order, Title */}
        <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
          {/* Drag Handle */}
          <div
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-600 group-hover:text-zinc-400 p-1 -ml-1 mt-1 rounded hover:bg-zinc-800/80 transition-colors"
            title="ลากเพื่อเปลี่ยนลำดับเพลง"
          >
            <GripVertical className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* Order number */}
          <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center font-bold text-zinc-300 text-xs sm:text-sm">
            {index + 1}
          </div>

          {/* Title & Artist */}
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 truncate group-hover:text-rose-400 transition-colors">
              {song.title}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
              <Music className="w-3.5 h-3.5 text-zinc-500" />
              {song.artist || 'ไม่ระบุศิลปิน'}
            </p>
          </div>
        </div>

        {/* Right side: Key Badges & Action Buttons */}
        <div className="flex items-start gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex flex-col items-end gap-1">
            <Badge variant="rose" className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-bold shadow-sm">
              <Key className="w-3 h-3 mr-1" />
              Key {song.playKey || song.originalKey || 'C'}
            </Badge>
            {isKeyTransposed && (
              <span className="text-[11px] text-zinc-400 font-medium">
                (เดิม: {song.originalKey})
              </span>
            )}
          </div>

          {/* Action buttons (Edit & Delete) */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(song)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              title="แก้ไขเพลง"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(song)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="ลบเพลง"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Meta tags: BPM, Version Link, Chord Link & Mobile Up/Down arrows */}
      <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {song.tempoBpm && (
            <Badge variant="amber" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {song.tempoBpm} BPM
            </Badge>
          )}

          {song.versionUrl && (
            <button
              type="button"
              onClick={() => onOpenVideo ? onOpenVideo(song) : window.open(song.versionUrl, '_blank')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors font-medium cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" />
              เวอร์ชันซ้อม
            </button>
          )}

          {(song.chordUrl || song.chordContent) && (
            <button
              type="button"
              onClick={() => onOpenChord && onOpenChord(song)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 transition-colors font-medium cursor-pointer"
            >
              <FileText className="w-3 h-3" />
              ดูคอร์ดเพลง
            </button>
          )}
        </div>

        {/* Mobile Up/Down arrows */}
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp && onMoveUp(index)}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="เลื่อนขึ้น"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            disabled={index === totalSongs - 1}
            onClick={() => onMoveDown && onMoveDown(index)}
            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="เลื่อนลง"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Notes / Arrangement info */}
      {song.notes && (
        <div className="mt-3 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/50 text-xs text-zinc-300 leading-relaxed">
          <span className="font-semibold text-amber-400 mr-1.5">โน้ตวง:</span>
          {song.notes}
        </div>
      )}
    </div>
  );
};
