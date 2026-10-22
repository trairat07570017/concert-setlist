import React, { useState, useEffect } from 'react';
import { Song } from '../../domain/song';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Mic2,
  Flame,
  Music,
  Play,
  X,
  Keyboard,
  Scroll,
  Sparkles,
  Layers
} from 'lucide-react';

interface StageLaunchModalProps {
  isOpen: boolean;
  songs: Song[];
  onClose: () => void;
  onConfirmLaunch: () => void;
}

export const StageLaunchModal: React.FC<StageLaunchModalProps> = ({
  isOpen,
  songs,
  onClose,
  onConfirmLaunch
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [autoStart, setAutoStart] = useState(true);

  // Initialize countdown whenever modal opens
  useEffect(() => {
    if (isOpen && songs.length > 0) {
      if (autoStart) {
        setCountdown(3);
      } else {
        setCountdown(null);
      }
    } else {
      setCountdown(null);
    }
  }, [isOpen, autoStart, songs.length]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || !isOpen) return;

    if (countdown === 0) {
      onConfirmLaunch();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isOpen, onConfirmLaunch]);

  if (!isOpen) return null;

  const firstSong = songs[0];
  const uniqueKeys = Array.from(new Set(songs.map((s) => s.playKey || s.originalKey))).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Darkened backdrop with stage spotlight vibe */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-2xl shadow-amber-950/60 p-6 sm:p-8 overflow-hidden z-10 text-zinc-100">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-gradient-to-b from-amber-500/20 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          title="ปิด"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stage Header */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-amber-400 flex items-center justify-center text-zinc-950 shadow-xl shadow-amber-500/20 animate-pulse">
              <Mic2 className="w-8 h-8 text-zinc-950" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-950 rounded-full border border-amber-500/40 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Concert Stage Mode
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              READY TO ROCK!
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              โหมดแสดงสดบนเวที • คอร์ดคอนทราสต์สูง ตัวหนังสือใหญ่ เลื่อนอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Setlist Summary Card */}
        {songs.length > 0 ? (
          <div className="mt-6 space-y-3.5">
            <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 pb-2 border-b border-zinc-800/80">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  สรุป Setlist คืนนี้
                </span>
                <Badge variant="amber" className="px-2.5 py-0.5 text-xs font-bold">
                  {songs.length} เพลง
                </Badge>
              </div>

              {firstSong && (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Music className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-zinc-400">เพลงเปิดเวที:</span>
                    <span className="font-bold text-zinc-100 truncate">{firstSong.title}</span>
                  </div>
                  <Badge variant="rose" className="shrink-0 text-[11px] font-bold">
                    Key {firstSong.playKey || firstSong.originalKey}
                  </Badge>
                </div>
              )}

              {uniqueKeys.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                  <span className="text-zinc-500">คีย์เพลงทั้งหมด:</span>
                  {uniqueKeys.map((k) => (
                    <span
                      key={k}
                      className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded-md text-[10px] font-bold border border-zinc-700/60"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
              <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ปุ่ม Spacebar สั่งเลื่อนคอร์ด</span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-center gap-2">
                <Scroll className="w-4 h-4 text-rose-400 shrink-0" />
                <span>ลูกศร ซ้าย-ขวา สลับเพลง</span>
              </div>
            </div>

            {/* Action Buttons & Countdown */}
            <div className="pt-2 space-y-3">
              <Button
                variant="stage"
                size="lg"
                onClick={onConfirmLaunch}
                className="w-full py-3.5 text-sm sm:text-base font-black shadow-xl shadow-amber-950/60 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                {countdown !== null && countdown > 0
                  ? `ขึ้นเวทีทันที (${countdown}s)`
                  : 'ขึ้นเวทีทันที (Enter Stage)'}
              </Button>

              <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoStart}
                    onChange={(e) => setAutoStart(e.target.checked)}
                    className="rounded bg-zinc-800 border-zinc-700 text-amber-500 focus:ring-0"
                  />
                  <span>นับถอยหลังขึ้นเวทีอัตโนมัติ (3s)</span>
                </label>

                <button
                  type="button"
                  onClick={onClose}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center space-y-4 py-4">
            <p className="text-sm text-zinc-400">ยังไม่มีเพลงใน Setlist กรุณาเพิ่มเพลงก่อนเปิดโหมดเวที</p>
            <Button variant="secondary" size="sm" onClick={onClose}>
              กลับไปเพิ่มเพลง
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
