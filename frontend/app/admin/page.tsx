import Link from "next/link";

const pendingReports = [
  {
    id: "RPT-1024",
    event: "Flood",
    city: "Mumbai",
    score: 52,
    status: "Pending",
  },
  {
    id: "RPT-1025",
    event: "Heatwave",
    city: "Patna",
    score: 45,
    status: "Pending",
  },
  {
    id: "RPT-1026",
    event: "Other",
    city: "Kolkata",
    score: 8,
    status: "Flagged",
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 p-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-xl font-bold text-cyan-300">
            CLIMATRIX
          </Link>

          <Link
            href="/citizen"
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium transition hover:bg-slate-800"
          >
            Citizen View
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-amber-300">
              Protected Operations Console
            </p>
            <h1 className="mt-2 text-3xl font-bold">Admin Review Panel</h1>
            <p className="mt-2 text-slate-400">
              Review pending, flagged and duplicate reports before publication.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm text-emerald-300">
            ● Admin API requires JWT authentication
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total Reports</p>
            <p className="mt-2 text-3xl font-bold">20</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Pending Review</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">6</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Flagged Reports</p>
            <p className="mt-2 text-3xl font-bold text-red-400">2</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Auto Verified</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">3</p>
          </div>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5">
            <h2 className="text-xl font-semibold">Review Queue</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Event</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Credibility</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Review Actions</th>
                </tr>
              </thead>

              <tbody>
                {pendingReports.map((report) => (
                  <tr
                    key={report.id}
                    className="border-t border-slate-800"
                  >
                    <td className="p-4 font-mono text-cyan-300">
                      {report.id}
                    </td>
                    <td className="p-4">{report.event}</td>
                    <td className="p-4 text-slate-300">{report.city}</td>
                    <td className="p-4">
                      <span
                        className={
                          report.score < 25
                            ? "text-red-400"
                            : "text-amber-300"
                        }
                      >
                        {report.score}/100
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-amber-950 px-3 py-1 text-xs text-amber-300">
                        {report.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950">
                          Verify
                        </button>
                        <button className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white">
                          Reject
                        </button>
                        <button className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200">
                          Flag
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
