import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../../domain/song';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Key,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  List
} from 'lucide-react';
import { calculateSemitoneDifference, transposeChordSheet } from '../chord-viewer/transposer';

interface StageModeViewProps {
  songs: Song[];
  initialIndex?: number;
  onClose: () => void;
}

export const StageModeView: React.FC<StageModeViewProps> = ({
  songs,
  initialIndex = 0,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [fontSize, setFontSize] = useState(18); // default px
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1); // 1 = normal
  const [isSongListOpen, setIsSongListOpen] = useState(false);

  const chordScrollRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  const currentSong = songs[currentIndex] || songs[0];

  // Calculate transposed chords based on currentSong's playKey vs originalKey
  const semitones = calculateSemitoneDifference(currentSong.originalKey, currentSong.playKey);
  const displayedChords = currentSong.chordContent
    ? transposeChordSheet(currentSong.chordContent, semitones)
    : '';

  // Reset scroll and auto-scroll state when song changes
  useEffect(() => {
    setIsAutoScrolling(false);
    if (chordScrollRef.current) {
      chordScrollRef.current.scrollTop = 0;
    }
  }, [currentIndex]);

  // Handle auto-scroll loop
  useEffect(() => {
    if (isAutoScrolling) {
      const scrollStep = () => {
        if (chordScrollRef.current) {
          chordScrollRef.current.scrollTop += scrollSpeed * 0.8;
          // Stop if reached bottom
          if (
            chordScrollRef.current.scrollTop + chordScrollRef.current.clientHeight >=
            chordScrollRef.current.scrollHeight - 5
          ) {
            setIsAutoScrolling(false);
          }
        }
      };

      scrollIntervalRef.current = window.setInterval(scrollStep, 30);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrev();
      } else if (e.code === 'Space') {
        // Toggle auto-scroll with spacebar
        e.preventDefault();
        setIsAutoScrolling((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, songs.length]);

  const goToNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Top Stage Bar */}
      <header className="flex-shrink-0 h-16 border-b border-zinc-850 px-4 sm:px-6 flex items-center justify-between bg-zinc-950">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSongListOpen(!isSongListOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-bold text-amber-400 transition-colors"
          >
            <List className="w-4 h-4" />
            <span>เพลงที่ {currentIndex + 1}/{songs.length}</span>
          </button>
        </div>

        {/* View Controls: Zoom & Exit */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1 text-xs">
            <button
              onClick={() => setFontSize((s) => Math.max(14, s - 2))}
              className="p-1 hover:text-rose-400"
              title="ลดขนาดตัวอักษร"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-zinc-400 px-1">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(32, s + 2))}
              className="p-1 hover:text-rose-400"
              title="เพิ่มขนาดตัวอักษร"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>ออก (ESC)</span>
          </button>
        </div>
      </header>

      {/* Main Stage Presentation Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left / Song Info & Stage Display */}
        <div className="p-6 md:p-8 flex-shrink-0 md:w-96 border-b md:border-b-0 md:border-r border-zinc-900 bg-zinc-950/80 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">
                TRACK #{currentIndex + 1}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1 leading-tight">
                {currentSong.title}
              </h1>
              <p className="text-lg text-zinc-400 font-medium mt-1">
                {currentSong.artist || 'ไม่ระบุศิลปิน'}
              </p>
            </div>

            {/* Huge Performance Key Box */}
            <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 flex items-center justify-between shadow-xl shadow-amber-950/20">
              <div className="flex items-center gap-2.5">
                <Key className="w-6 h-6 text-amber-400" />
                <span className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                  PLAY KEY
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-amber-300">
                {currentSong.playKey || currentSong.originalKey || 'C'}
              </div>
            </div>

            {/* Tempo BPM & Original Key */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400" />
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">TEMPO</div>
                  <div className="text-base font-bold text-zinc-200">
                    {currentSong.tempoBpm ? `${currentSong.tempoBpm} BPM` : 'ไม่ระบุ'}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase font-bold">ORIGINAL KEY</div>
                <div className="text-base font-bold text-zinc-300">
                  {currentSong.originalKey || 'C'}
                </div>
              </div>
            </div>

            {/* Performance Notes */}
            {currentSong.notes && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 leading-relaxed">
                <span className="font-bold text-rose-400 block mb-1 uppercase tracking-wider text-[11px]">
                  📌 โน้ตการเล่นสำหรับวง:
                </span>
                {currentSong.notes}
              </div>
            )}
          </div>

          {/* Previous / Next buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 border border-zinc-800 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>ก่อนหน้า</span>
            </button>

            <button
              onClick={goToNext}
              disabled={currentIndex === songs.length - 1}
              className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-20 text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-950/40"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right / Chord Sheet with Auto-scroll */}
        <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
          {/* Auto-scroll tool ribbon */}
          <div className="px-6 py-2.5 border-b border-zinc-900 bg-zinc-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  isAutoScrolling
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-950/40'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                }`}
              >
                {isAutoScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isAutoScrolling ? 'หยุดเลื่อน (Space)' : 'เลื่อนอัตโนมัติ (Space)'}</span>
              </button>

              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                {[0.5, 1, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setScrollSpeed(speed)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      scrollSpeed === speed ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (chordScrollRef.current) chordScrollRef.current.scrollTop = 0;
                setIsAutoScrolling(false);
              }}
              className="text-zinc-400 hover:text-white flex items-center gap-1"
              title="กลับไปบนสุด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>บนสุด</span>
            </button>
          </div>

          {/* Chord sheet content display */}
          <div
            ref={chordScrollRef}
            className="flex-1 p-6 md:p-8 overflow-y-auto font-mono leading-relaxed"
            style={{ fontSize: `${fontSize}px` }}
          >
            {displayedChords ? (
              <pre className="whitespace-pre-wrap text-zinc-100 select-text">
                {displayedChords}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-2">
                <p className="text-base font-sans">ไม่มีคอร์ดเพลงนี้ในระบบ</p>
                <p className="text-xs font-sans text-zinc-500">
                  สามารถกดออกจาก Stage Mode เพื่อไปใส่คอร์ดเพลงได้
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Song Switcher Overlay Drawer */}
        {isSongListOpen && (
          <div className="absolute inset-0 z-20 bg-black/85 backdrop-blur-md flex flex-col p-6 max-w-md border-r border-zinc-800">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="font-bold text-base text-zinc-100">เลือกเพลงใน Setlist</h3>
              <button
                onClick={() => setIsSongListOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-1.5">
              {songs.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsSongListOpen(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                    idx === currentIndex
                      ? 'bg-rose-600 text-white font-bold'
                      : 'hover:bg-zinc-900 text-zinc-300'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="opacity-60 mr-2 text-xs font-mono">#{idx + 1}</span>
                    <span>{s.title}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-black/40 font-bold flex-shrink-0">
                    Key {s.playKey}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
