import React, { useState, useEffect } from 'react';
import { Song } from '../../domain/song';
import { Modal } from '../../components/ui/modal';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { SongRepository } from '../../repositories/song-repository';
import {
  calculateSemitoneDifference,
  transposeChordSheet
} from './transposer';
import {
  Download,
  RotateCcw,
  Minus,
  Plus,
  Pencil,
  Eye,
  Save,
  ExternalLink,
  Music
} from 'lucide-react';

interface ChordViewerModalProps {
  isOpen: boolean;
  song: Song | null;
  onClose: () => void;
  repository: SongRepository;
  onUpdateSongChords: (id: string, chordContent: string, chordUrl?: string) => Promise<void>;
}

export const ChordViewerModal: React.FC<ChordViewerModalProps> = ({
  isOpen,
  song,
  onClose,
  repository,
  onUpdateSongChords
}) => {
  const [chordText, setChordText] = useState('');
  const [chordUrlInput, setChordUrlInput] = useState('');
  const [semitones, setSemitones] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingDochord, setIsFetchingDochord] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Initialize modal state whenever song changes
  useEffect(() => {
    if (song) {
      setChordText(song.chordContent || '');
      setChordUrlInput(song.chordUrl || '');
      setIsEditing(!song.chordContent);
      setStatusMessage(null);

      // Auto-calculate semitone shift based on originalKey and playKey
      if (song.originalKey && song.playKey) {
        const diff = calculateSemitoneDifference(song.originalKey, song.playKey);
        setSemitones(diff);
      } else {
        setSemitones(0);
      }
    }
  }, [song]);

  if (!song) return null;

  const handleFetchDochord = async () => {
    const targetUrl = chordUrlInput.trim() || song.chordUrl;
    if (!targetUrl) {
      setStatusMessage('กรุณาระบุลิงก์เว็บ DoChord ก่อน');
      return;
    }

    try {
      setIsFetchingDochord(true);
      setStatusMessage('กำลังดึงคอร์ดจาก DoChord...');
      const fetchedContent = await repository.fetchChordFromDochord(targetUrl);
      setChordText(fetchedContent);
      setIsEditing(false);
      setStatusMessage('ดึงคอร์ดสำเร็จ! สามารถกดบันทึกเพื่อเก็บไว้ในชีต');
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'ดึงคอร์ดไม่สำเร็จ');
    } finally {
      setIsFetchingDochord(false);
    }
  };

  const handleSaveChords = async () => {
    try {
      setIsSaving(true);
      setStatusMessage(null);
      await onUpdateSongChords(song.id, chordText, chordUrlInput.trim());
      setStatusMessage('บันทึกคอร์ดเรียบร้อยแล้ว');
      setIsEditing(false);
    } catch (err: unknown) {
      setStatusMessage(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const displayedChords = isEditing ? chordText : transposeChordSheet(chordText, semitones);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`คอร์ดเพลง: ${song.title}`}
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Song info and Key bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-bold text-zinc-100">{song.artist}</span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">คีย์ต้นฉบับ: <span className="font-semibold text-zinc-200">{song.originalKey}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">คีย์ที่วงเล่น:</span>
            <Badge variant="rose" className="px-3 py-0.5 text-xs font-bold">
              Key {song.playKey}
            </Badge>
          </div>
        </div>

        {/* DoChord Fetching Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl">
          <div className="flex-1 relative">
            <input
              type="url"
              value={chordUrlInput}
              onChange={(e) => setChordUrlInput(e.target.value)}
              placeholder="แปะลิงก์ DoChord เช่น https://www.dochord.com/12345/"
              className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-700/60 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isFetchingDochord}
              onClick={handleFetchDochord}
              className="flex-1 sm:flex-initial"
            >
              <Download className={`w-3.5 h-3.5 ${isFetchingDochord ? 'animate-bounce' : ''}`} />
              {isFetchingDochord ? 'กำลังดึง...' : 'ดึงคอร์ดจาก DoChord'}
            </Button>
            {chordUrlInput && (
              <a
                href={chordUrlInput}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                title="เปิดเว็บ DoChord"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className="px-3.5 py-2 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-xs text-amber-300">
            {statusMessage}
          </div>
        )}

        {/* Transposition & View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Semitone adjustment buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-semibold mr-1">ทดคีย์ (Transpose):</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSemitones((prev) => prev - 1)}
              className="w-8 h-8 p-0"
              title="ลดลงครึ่งเสียง (-1)"
            >
              <Minus className="w-3.5 h-3.5" />
            </Button>

            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700/60 text-rose-300 min-w-[3.5rem] text-center">
              {semitones > 0 ? `+${semitones}` : semitones} st
            </span>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSemitones((prev) => prev + 1)}
              className="w-8 h-8 p-0"
              title="เพิ่มขึ้นครึ่งเสียง (+1)"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (song.originalKey && song.playKey) {
                  setSemitones(calculateSemitoneDifference(song.originalKey, song.playKey));
                } else {
                  setSemitones(0);
                }
              }}
              className="text-xs text-zinc-400 hover:text-white"
              title="รีเซ็ตกลับไปคีย์ที่วงเล่น"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              ตามคีย์วง
            </Button>
          </div>

          {/* Mode switch (Viewer vs Edit) */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={isEditing ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  ดูตัวอย่าง
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  แก้ไขคอร์ด
                </>
              )}
            </Button>

            {isEditing && (
              <Button
                type="button"
                variant="stage"
                size="sm"
                disabled={isSaving}
                onClick={handleSaveChords}
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            )}
          </div>
        </div>

        {/* Chord Content Display Area */}
        <div className="relative border border-zinc-800 rounded-2xl bg-zinc-950 p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
          {isEditing ? (
            <textarea
              rows={16}
              value={chordText}
              onChange={(e) => setChordText(e.target.value)}
              placeholder="พิมพ์หรือวางเนื้อเพลงและคอร์ดที่นี่..."
              className="w-full h-full bg-transparent text-zinc-100 font-mono text-sm leading-relaxed focus:outline-none resize-none"
            />
          ) : displayedChords ? (
            <pre className="font-mono text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed select-text">
              {displayedChords}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500 space-y-2">
              <p className="text-sm">ยังไม่มีคอร์ดเพลงนี้</p>
              <p className="text-xs text-zinc-400">ใส่ลิงก์ DoChord ด้านบนแล้วกดดึงคอร์ด หรือกดแก้ไขคอร์ดเพื่อวางด้วยตนเอง</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
