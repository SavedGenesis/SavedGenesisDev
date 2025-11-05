import { ServerStatus } from '@/components/ServerStatus';

export const dynamic = 'force-dynamic';

export default function NetworkPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">SavedGenesis Network</h1>
      <p className="max-w-2xl opacity-80">Live status for the entire network via our Velocity proxy.</p>
      <ServerStatus host="play.savedgenesis.com" port={25565} name="SavedGenesis Network" />
      <div className="pt-4">
        <a
          className="inline-flex items-center rounded bg-white px-4 py-2 font-medium text-black hover:opacity-90"
          href="https://store.savedgenesis.com"
          rel="noopener noreferrer"
        >
          Visit the Store
        </a>
      </div>
    </div>
  );
}


