'use client';

import { useState } from 'react';
import { ServerStatus } from '@/components/ServerStatus';

export default function PlayerCountTool() {
  // Input fields
  const [hostInput, setHostInput] = useState('');
  const [portInput, setPortInput] = useState(25565);
  // Query used for the status card, only updates on submit
  const [hostQuery, setHostQuery] = useState<string | null>(null);
  const [portQuery, setPortQuery] = useState<number>(25565);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHostQuery(hostInput);
    setPortQuery(portInput);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Player Count</h1>
      <p className="opacity-80">Check live players for any Java server.</p>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-3">
        <input
          className="min-w-[260px] flex-1 rounded border border-white/15 bg-transparent px-3 py-2"
          placeholder="host (e.g., play.example.com)"
          value={hostInput}
          onChange={(e) => setHostInput(e.target.value.trim())}
          required
          pattern="^[a-zA-Z0-9.-]+$"
        />
        <input
          className="w-28 rounded border border-white/15 bg-transparent px-3 py-2"
          type="number"
          min={1}
          max={65535}
          value={portInput}
          onChange={(e) => setPortInput(Number(e.target.value))}
        />
        <button className="rounded bg-white px-4 py-2 font-medium text-black" type="submit">
          Check
        </button>
      </form>
      {hostQuery && (
        <div>
          <ServerStatus host={hostQuery} port={portQuery} />
        </div>
      )}

      <div className="pt-4 space-y-4">
        <h2 className="text-xl font-semibold">Popular servers</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ServerStatus host="play.savedgenesis.com" name="SavedGenesis Network" />
          <ServerStatus host="play.flamefrags.com" name="FlameFrags Network" />
          <ServerStatus host="mc.hypixel.net" name="Hypixel Network" />
          <ServerStatus host="us.mineplex.com" name="Mineplex US" />
          <ServerStatus host="bee.mc-complex.com" name="MC Complex (Bee)" />
          <ServerStatus host="play.pvplegacy.net" name="PvP Legacy" />
          <ServerStatus host="lifesteal.net" name="Lifesteal Network" />
          <ServerStatus host="play.applemc.fun" name="AppleMC" />
          <ServerStatus host="play.freshsmp.fun" name="FreshSMP" />
          <ServerStatus host="mbs.netherite.gg" name="Netherite MBS" />
        </div>
      </div>
    </div>
  );
}


