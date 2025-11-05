export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">savedgenesis</h1>
      <p className="max-w-2xl text-zinc-300">
        A modern hub for the SavedGenesis Minecraft Network and useful tools
        for players and developers.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        <a href="/network" className="group rounded-xl border border-white/10 p-6 hover:border-white/20">
          <h2 className="text-xl font-semibold">Minecraft Network →</h2>
          <p className="mt-2 opacity-80">Lifesteal, Duels, and Survival. Live status and info.</p>
        </a>
        <a href="/tools/player-count" className="group rounded-xl border border-white/10 p-6 hover:border-white/20">
          <h2 className="text-xl font-semibold">Player Count Tool →</h2>
          <p className="mt-2 opacity-80">Check live players for any Java server.</p>
        </a>
        <a href="/tools/outages" className="group rounded-xl border border-white/10 p-6 hover:border-white/20">
          <h2 className="text-xl font-semibold">Outages →</h2>
          <p className="mt-2 opacity-80">Centralized status and notices.</p>
        </a>
        <a href="/discord-bot" className="group rounded-xl border border-white/10 p-6 hover:border-white/20">
          <h2 className="text-xl font-semibold">Discord Bot →</h2>
          <p className="mt-2 opacity-80">Slash command `/namemc &lt;username&gt;` and more.</p>
        </a>
      </div>
    </div>
  );
}
