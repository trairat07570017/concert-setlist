import React from 'react';
import { Modal } from '../../components/ui/modal';
import { ExternalLink } from 'lucide-react';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  artist: string;
  url: string;
}

function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  artist,
  url
}) => {
  const videoId = extractYouTubeVideoId(url);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ซ้อมเวอร์ชัน: ${title}`}
      maxWidth="xl"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>ศิลปิน: <strong className="text-zinc-200">{artist}</strong></span>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium"
          >
            เปิดใน YouTube <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {videoId ? (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        ) : (
          <div className="p-8 text-center bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
            <p className="text-sm text-zinc-300">
              ลิงก์นี้ไม่ใช่ YouTube หรือไม่สามารถฝังเครื่องเล่นในหน้านี้ได้
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition-colors"
            >
              เปิดฟังผ่านลิงก์ต้นทาง <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
