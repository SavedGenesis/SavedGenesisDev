'use client';

import { useEffect, useState } from 'react';

type Props = { host: string; port?: number; name?: string; bannerUrl?: string };

function deriveNameFromHost(host: string): string {
  const withoutPrefix = host.replace(/^play\.|^mc\./, '').replace(/\.[^.]+$/, '');
  return withoutPrefix
    .split(/[.-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export function ServerStatus({ host, port = 25565, name, bannerUrl }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    online: boolean;
    players?: { online: number; max: number };
    version?: string;
    latencyMs?: number;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch(`/api/minecraft/status?host=${encodeURIComponent(host)}&port=${port}`)
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        setData(d);
        setError(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [host, port]);

  if (loading) return <div className="text-sm opacity-70">Checking…</div>;
  if (error) return <div className="text-sm text-red-400">Error: {error}</div>;
  if (!data) return null;

  const displayName = name || deriveNameFromHost(host) + ' Network';

  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      {bannerUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={bannerUrl} alt={displayName} className="h-20 w-full object-cover" />
      ) : (
        <div className="h-20 w-full bg-white/5 flex items-center px-4 text-base font-medium">
          {displayName}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold">
            {data.online ? 'Online' : 'Offline'}
          </div>
          <div className="text-right">
            <div className="text-sm opacity-70">Players</div>
            <div className="text-xl font-semibold">
              {data.players?.online ?? 0} / {data.players?.max ?? 0}
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs opacity-70">{host}:{port}</div>
        {data.version && (
          <div className="mt-1 text-xs opacity-60">Version: {data.version}</div>
        )}
        {typeof data.latencyMs === 'number' && (
          <div className="mt-1 text-xs opacity-60">Ping: {Math.round(data.latencyMs)} ms</div>
        )}
      </div>
    </div>
  );
}


