export default function DiscordBotPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Discord Bot</h1>
      <p className="opacity-80">
        Use <code className="px-1 rounded bg-white/10">/namemc &lt;username&gt;</code> in Discord to get a direct link to a
        player&apos;s NameMC page. Simple and fast.
      </p>
      <div className="rounded-lg border border-white/10 p-4 space-y-2">
        <div className="text-sm opacity-70">Examples</div>
        <pre className="overflow-auto rounded bg-white/5 p-3 text-sm">
{`/namemc Notch
/namemc savedgenesis`}
        </pre>
        <a
          className="inline-flex items-center rounded bg-white px-4 py-2 font-medium text-black hover:opacity-90"
          href="#"
          aria-disabled
        >
          Invite Link (coming soon)
        </a>
      </div>
      <div className="text-xs opacity-60">We do not store message content or user data.</div>
    </div>
  );
}


