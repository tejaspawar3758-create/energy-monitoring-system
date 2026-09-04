import { storageKind } from '../server/campusStore.ts';

type VercelResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

export default async function handler(_req: unknown, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  const kind = storageKind();
  res.status(200).json({
    ok: true,
    storage: kind,
    isCloudSynced: kind === 'neon',
    isVercel: !!process.env.VERCEL,
    message: kind === 'neon'
      ? 'Connected to cloud database (multi-device real-time sync active)'
      : 'Using local file storage. Set DATABASE_URL in Vercel to sync across multiple PCs.',
  });
}
