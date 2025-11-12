export default function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="h2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

