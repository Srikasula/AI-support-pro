import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">AI-Support Pro</h1>
        <p className="text-sm text-gray-600 mt-1">Step 2: Tickets + mock API</p>
        <div className="mt-3">
          <Link className="underline text-sm" href="/tickets">Open Tickets</Link>
        </div>
      </header>
    </>
  );
}
