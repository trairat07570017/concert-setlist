import React from 'react';
import { Song } from '../../domain/song';
import { Badge } from '../../components/ui/badge';
import { Music, Play, FileText, Clock, Key } from 'lucide-react';

interface SongCardProps {
  song: Song;
  index: number;
  onEdit?: (song: Song) => void;
  onDelete?: (song: Song) => void;
  onOpenChord?: (song: Song) => void;
}

export const SongCard: React.FC<SongCardProps> = ({
  song,
  index,
  onOpenChord,
}) => {
  const isKeyTransposed = song.playKey && song.originalKey && song.playKey !== song.originalKey;

  return (
    <div className="group relative bg-zinc-900/80 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-4 sm:p-5 transition-all duration-200 shadow-lg shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        {/* Left side: Order number and title */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-bold text-zinc-300 text-sm sm:text-base">
            {index + 1}
          </div>
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

        {/* Right side: Key Badges */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Badge variant="rose" className="px-3 py-1 text-sm font-bold shadow-sm">
              <Key className="w-3 h-3 mr-1" />
              Key {song.playKey || song.originalKey || 'C'}
            </Badge>
          </div>
          {isKeyTransposed && (
            <span className="text-[11px] text-zinc-400 font-medium">
              (เดิม: {song.originalKey})
            </span>
          )}
        </div>
      </div>

      {/* Meta tags: BPM, Version Link, Chord Link */}
      <div className="mt-3.5 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center gap-2 text-xs">
        {song.tempoBpm && (
          <Badge variant="amber" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {song.tempoBpm} BPM
          </Badge>
        )}

        {song.versionUrl && (
          <a
            href={song.versionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20 transition-colors font-medium"
          >
            <Play className="w-3 h-3 fill-current" />
            เวอร์ชันซ้อม
          </a>
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
