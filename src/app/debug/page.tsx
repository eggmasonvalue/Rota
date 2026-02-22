'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [status, setStatus] = useState<string>('Initializing...');
  const [configInfo, setConfigInfo] = useState<{ url: string, keyPrefix: string }>({ url: '', keyPrefix: '' });

  useEffect(() => {
    // 1. Check Config
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING';
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'MISSING';

    setConfigInfo({
      url: url,
      keyPrefix: key.substring(0, 15) + '...',
    });

    if (url === 'MISSING' || key === 'MISSING') {
      setStatus('ERROR: Missing Environment Variables. Check .env.local');
      return;
    }

    // 2. Test Connection
    setStatus('Connecting to Supabase Realtime...');

    const channel = supabase.channel('debug_room');

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setStatus('SUCCESS: Connected to Realtime! Configuration is valid.');
      } else if (status === 'CLOSED') {
        setStatus('DISCONNECTED: Channel closed.');
      } else if (status === 'CHANNEL_ERROR') {
        setStatus('ERROR: Channel error. Check console for details. Likely invalid URL/Key or RLS policy.');
      } else if (status === 'TIMED_OUT') {
        setStatus('ERROR: Timed out. Firewall?');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Debugger</h1>

      <div className="bg-gray-800 p-4 rounded-lg mb-4">
        <h2 className="text-xl font-bold mb-2">Configuration</h2>
        <p><strong>URL:</strong> {configInfo.url}</p>
        <p><strong>Key (Prefix):</strong> {configInfo.keyPrefix}</p>
      </div>

      <div className={`p-4 rounded-lg font-bold text-lg ${status.startsWith('SUCCESS') ? 'bg-green-900 text-green-200' : status.startsWith('ERROR') ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}`}>
        {status}
      </div>

      <div className="mt-8 text-gray-400 text-sm">
        <p>If you see an error:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Ensure <code>NEXT_PUBLIC_SUPABASE_URL</code> starts with <code>https://</code> and ends with <code>.supabase.co</code> (usually).</li>
          <li>Ensure <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> is the <strong>Project API Key</strong> (anon/public) from your dashboard.</li>
          <li>Check browser console (F12) for detailed network errors (CORS, 401, etc).</li>
        </ul>
      </div>

      <a href="/" className="mt-8 inline-block text-blue-400 hover:underline">&larr; Back to Game</a>
    </div>
  );
}
