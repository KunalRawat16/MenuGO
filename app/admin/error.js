'use client';

import { useEffect } from 'react';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function AdminError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    console.error('Admin Dashboard Error Boundary caught:', error);
  }, [error]);

  const handleLogout = async () => {
    await logoutAction();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center font-sans text-gray-200">
      <div className="max-w-md w-full bg-white/5 rounded-3xl border border-white/10 p-8 space-y-6 backdrop-blur-md">
        <div className="mx-auto w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 border border-red-500/20">
          <ShieldAlert size={32} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Console Error</h1>
          <p className="text-gray-400 font-bold leading-relaxed text-sm">
            An error occurred while loading the administrative console. If the problem persists, please re-authenticate.
          </p>
        </div>

        {error?.message && (
          <div className="p-4 bg-black/40 rounded-xl text-left border border-white/5">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider block mb-1">Details</span>
            <code className="text-xs font-mono font-bold text-red-400 block break-all">{error.message}</code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer shadow-lg shadow-green-500/20"
          >
            <RefreshCw size={18} />
            Retry Panel
          </button>
          
          <button
            onClick={handleLogout}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <LogOut size={18} />
            Re-Authenticate
          </button>
        </div>
      </div>
    </div>
  );
}
