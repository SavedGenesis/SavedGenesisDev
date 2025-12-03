import { status } from 'minecraft-server-util';

export type MinecraftStatus = {
  online: boolean;
  motd?: string;
  version?: string;
  players?: { online: number; max: number };
  latencyMs?: number;
};

const cache = new Map<string, { expiresAt: number; data: MinecraftStatus }>();

function getCacheKey(host: string, port: number): string {
  return `${host}:${port}`;
}

export async function getMinecraftStatus(host: string, port: number, ttlMs = 8000): Promise<MinecraftStatus> {
  const key = getCacheKey(host, port);
  const now = Date.now();
  const cached = cache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const result = await status(host, port, { timeout: 4000 });
    const motdClean = result.motd?.clean;
    let motd: string | undefined;
    if (typeof motdClean === 'string') {
      motd = motdClean;
    } else if (Array.isArray(motdClean)) {
      motd = (motdClean as Array<string | number | boolean | null | undefined>)
        .map((segment) => (segment ?? '').toString().trim())
        .filter(Boolean)
        .join(' ');
    }
    const data: MinecraftStatus = {
      online: true,
      motd,
      version: result.version?.name ?? undefined,
      players: { online: result.players?.online ?? 0, max: result.players?.max ?? 0 },
      latencyMs: result.roundTripLatency,
    };
    cache.set(key, { expiresAt: now + ttlMs, data });
    return data;
  } catch {
    const data: MinecraftStatus = { online: false };
    cache.set(key, { expiresAt: now + ttlMs, data });
    return data;
  }
}


