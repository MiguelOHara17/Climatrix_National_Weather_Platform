import Link from "next/link";

const sampleReports = [
  {
    event: "Flood",
    location: "Kolkata, West Bengal",
    status: "Verified",
    color: "bg-red-500",
  },
  {
    event: "Rainfall",
    location: "Mumbai, Maharashtra",
    status: "Auto Verified",
    color: "bg-blue-500",
  },
  {
    event: "Thunderstorm",
    location: "Guwahati, Assam",
    status: "Verified",
    color: "bg-violet-500",
  },
];

export default function CitizenPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 p-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cyan-300">
            CLIMATRIX
          </Link>

          <Link
            href="/admin"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
          >
            Admin Panel
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">
            Public Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Verified Weather Intelligence
          </h1>
          <p className="mt-2 text-slate-400">
            Public users see only verified and auto-verified reports.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Verified Reports</p>
            <p className="mt-2 text-4xl font-bold text-cyan-300">9</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Active Event Types</p>
            <p className="mt-2 text-4xl font-bold text-cyan-300">7</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Real-Time Stream</p>
            <p className="mt-2 text-xl font-bold text-emerald-400">
              ● Live Architecture
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="min-h-[360px] rounded-2xl border border-slate-800 bg-gradient-to-br from-cyan-950 via-slate-900 to-slate-950 p-6">
            <h2 className="text-xl font-semibold">National Weather Map</h2>
            <p className="mt-2 text-sm text-slate-400">
              GeoJSON-enabled map layer for verified reports.
            </p>

            <div className="relative mt-8 h-56 overflow-hidden rounded-xl border border-cyan-900 bg-slate-950">
              <div className="absolute left-[25%] top-[55%] h-4 w-4 rounded-full bg-red-500 shadow-[0_0_18px_5px_rgba(239,68,68,0.4)]" />
              <div className="absolute left-[38%] top-[65%] h-4 w-4 rounded-full bg-blue-500 shadow-[0_0_18px_5px_rgba(59,130,246,0.4)]" />
              <div className="absolute left-[55%] top-[45%] h-4 w-4 rounded-full bg-violet-500 shadow-[0_0_18px_5px_rgba(139,92,246,0.4)]" />
              <p className="absolute bottom-4 left-4 text-sm text-slate-500">
                Interactive Leaflet map integration in progress
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Latest Verified Reports</h2>

            <div className="mt-5 space-y-4">
              {sampleReports.map((report) => (
                <article
                  key={report.event}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${report.color}`} />
                      <h3 className="font-semibold">{report.event}</h3>
                    </div>
                    <span className="text-xs text-emerald-400">
                      {report.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {report.location}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Report a Weather Event</h2>
          <p className="mt-2 text-sm text-slate-400">
            Citizen reporting form will submit reports to the protected Node.js
            API for ML scoring and admin verification.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400"
              placeholder="City"
            />
            <select className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400">
              <option>Choose event type</option>
              <option>Rainfall</option>
              <option>Thunderstorm</option>
              <option>Flood</option>
              <option>Heatwave</option>
              <option>Fog</option>
              <option>Dust Storm</option>
              <option>Strong Wind</option>
              <option>Other</option>
            </select>
          </div>

          <textarea
            className="mt-4 min-h-28 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm outline-none focus:border-cyan-400"
            placeholder="Describe the observed weather event..."
          />

          <button className="mt-4 rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Submit Report
          </button>
        </section>
      </section>
    </main>
  );
}