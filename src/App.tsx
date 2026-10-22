import { getSongRepository } from './repositories';
import { SetlistView } from './modules/setlist/SetlistView';
import { Disc3, Database } from 'lucide-react';

const repository = getSongRepository();

export function App() {
  const isGasConfigured = Boolean(import.meta.env.VITE_GAS_API_URL);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
            <Disc3 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              CONCERT SETLIST
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                BAND EDITION
              </span>
            </h1>
            <p className="text-[11px] text-zinc-400 hidden xs:block">
              จัดการลิสต์เพลง คีย์ และเวอร์ชันซ้อมคอนเสิร์ต
            </p>
          </div>
        </div>

        {/* Database indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-400">
            <Database className={`w-3.5 h-3.5 ${isGasConfigured ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isGasConfigured ? 'Google Sheets' : 'Local Storage (Mock)'}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <SetlistView
          repository={repository}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 px-4 text-center text-xs text-zinc-400">
        <p>Concert Setlist • Built for seamless rehearsals & live stage performances</p>
        <p className="mt-1 text-zinc-400">Deployable to GitHub Pages & backed by Google Sheets via Google Apps Script</p>
      </footer>
    </div>
  );
}

export default App;
