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
  Music,
  ClipboardPaste,
  HelpCircle
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
      const msg = err instanceof Error ? err.message : 'ดึงคอร์ดไม่สำเร็จ';
      setStatusMessage(msg);
      setIsEditing(true);
    } finally {
      setIsFetchingDochord(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setChordText(text.trim());
        setIsEditing(true);
        setStatusMessage('วางคอร์ดจากคลิปบอร์ดเรียบร้อยแล้ว อย่าลืมกด "บันทึก" เพื่อเก็บเข้าชีต');
      } else {
        setStatusMessage('คลิปบอร์ดว่างเปล่า กรุณาคัดลอกคอร์ดจากหน้าเว็บมาก่อน');
      }
    } catch {
      setStatusMessage('เบราว์เซอร์ไม่อนุญาตให้อ่านคลิปบอร์ดอัตโนมัติ กรุณากดคลิกในกล่องข้อความแล้วกด Ctrl+V (หรือแตะค้างแล้วกดวาง)');
      setIsEditing(true);
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 hover:text-white text-xs font-semibold transition-colors"
                title="เปิดเว็บ DoChord เพื่อคัดลอกคอร์ด"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดเว็บดูคอร์ด</span>
              </a>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className="px-3.5 py-2.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-xs text-amber-200 leading-relaxed">
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

          {/* Mode switch (Viewer vs Edit) and Actions */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePasteClipboard}
              title="วางคอร์ดจากคลิปบอร์ด"
              className="text-xs font-medium"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">วางจากคลิปบอร์ด</span>
              <span className="sm:hidden">วาง</span>
            </Button>

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
              placeholder="พิมพ์หรือวางเนื้อเพลงและคอร์ดที่นี่... (เช่น คัดลอกจาก DoChord แล้วกด วางจากคลิปบอร์ด ด้านบน)"
              className="w-full h-full bg-transparent text-zinc-100 font-mono text-sm leading-relaxed focus:outline-none resize-none"
            />
          ) : displayedChords ? (
            <pre className="font-mono text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed select-text">
              {displayedChords}
            </pre>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500">
                <Music className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-100">ยังไม่มีเนื้อเพลงและคอร์ดสำหรับเพลงนี้</p>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  เนื่องจากเว็บ DoChord มีระบบป้องกันบอท (Cloudflare) บล็อกคำขอจากเซิร์ฟเวอร์ภายนอก ท่านสามารถนำคอร์ดมาใส่ได้ง่ายๆ ใน 2 ขั้นตอน:
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                {chordUrlInput ? (
                  <a
                    href={chordUrlInput}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950 transition-all hover:scale-[1.02]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    1. เปิดเว็บ DoChord แล้วกด Copy
                  </a>
                ) : (
                  <span className="text-xs text-zinc-500 italic">
                    (ใส่ลิงก์เว็บ DoChord ด้านบนเพื่อเปิดหน้าเพลง)
                  </span>
                )}

                <Button
                  type="button"
                  variant="stage"
                  size="sm"
                  onClick={handlePasteClipboard}
                  className="px-4 py-2"
                >
                  <ClipboardPaste className="w-4 h-4" />
                  2. วางคอร์ดจากคลิปบอร์ด
                </Button>
              </div>

              <div className="pt-2 text-[11px] text-zinc-500 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                <span>เมื่อวางคอร์ดแล้ว ระบบจะคำนวณทดคีย์ (Transpose) ไปยังคีย์ที่วงเล่นให้อัตโนมัติ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
