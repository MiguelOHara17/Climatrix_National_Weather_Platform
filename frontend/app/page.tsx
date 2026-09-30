import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl text-center">
        <p className="mb-4 text-sm tracking-[0.3em] text-cyan-300 uppercase">
          National Weather Intelligence Platform
        </p>

        <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
          CLIMATRIX
        </h1>

        <p className="mt-6 text-lg text-slate-300">
          Real-time weather reporting, verification, analytics, and disaster
          intelligence for India.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/citizen"
            className="rounded-xl bg-cyan-400 px-7 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Enter Citizen Dashboard
          </Link>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-600 px-7 py-4 font-semibold text-white transition hover:bg-slate-800"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  );
}