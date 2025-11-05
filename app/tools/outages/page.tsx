export default function OutagesPage() {
  const vendors = [
    { name: 'Minecraft / Mojang', url: 'https://status.mojang.com/' },
    { name: 'Xbox Network', url: 'https://support.xbox.com/xbox-live-status' },
    { name: 'Microsoft 365', url: 'https://status.office.com/' },
    { name: 'Azure', url: 'https://status.azure.com/en-us/status' },
    { name: 'AWS', url: 'https://health.aws.amazon.com/health/status' },
    { name: 'Outlook', url: 'https://portal.office.com/servicestatus' },
    { name: 'Microsoft Store', url: 'https://www.microsoft.com/en-us/store/b/servicestatus' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Outages</h1>
      <p className="opacity-80">
        Live links to official status pages. A consolidated feed and timeframe filter are coming soon.
      </p>

      <div className="rounded-lg border border-white/10 p-4">
        <div className="flex flex-wrap gap-3">
          <label className="text-sm opacity-80">Timeframe:</label>
          <select className="rounded border border-white/15 bg-transparent px-2 py-1 text-sm">
            <option value="24h">Last 24h</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <span className="text-xs opacity-60">(placeholder)</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {vendors.map((v) => (
          <a key={v.name} href={v.url} className="rounded border border-white/10 p-4 hover:border-white/20" rel="noopener noreferrer" target="_blank">
            <div className="text-lg font-semibold">{v.name}</div>
            <div className="text-sm opacity-70">Open official status page →</div>
          </a>
        ))}
      </div>
    </div>
  );
}


