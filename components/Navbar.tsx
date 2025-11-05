import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          savedgenesis
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/network" className="opacity-80 hover:opacity-100">Network</Link>
          <Link href="/tools/player-count" className="opacity-80 hover:opacity-100">Player Count</Link>
          <Link href="/tools/outages" className="opacity-80 hover:opacity-100">Outages</Link>
          <Link href="/discord-bot" className="opacity-80 hover:opacity-100">Discord Bot</Link>
          <a href="https://store.savedgenesis.com" className="rounded bg-white text-black px-3 py-1.5 font-medium hover:opacity-90" rel="noopener noreferrer">Store</a>
        </nav>
      </div>
    </header>
  );
}


