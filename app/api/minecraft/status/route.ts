import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getMinecraftStatus } from '@/lib/minecraftPing';

const querySchema = z.object({
  host: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9.-]+$/, 'invalid host'),
  port: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : 25565))
    .pipe(z.number().int().min(1).max(65535)),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    host: url.searchParams.get('host') ?? '',
    port: url.searchParams.get('port') ?? undefined,
  });
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid query', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { host, port } = parsed.data;
  const data = await getMinecraftStatus(host, port);
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=5',
    },
  });
}


