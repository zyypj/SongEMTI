import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center">
      <div className="text-center">
        <h1 className="text-4xl font-semibold">SongEMTI</h1>
        <p className="opacity-80 mt-2">Player com vibe Spotify usando YouTube</p>
        <Link href="/login" className="inline-block mt-6 rounded bg-emerald-500 px-6 py-2">
          Começar agora
        </Link>
      </div>
    </main>
  );
}
