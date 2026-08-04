export default function WeatherSkeleton() {
  return (
    <div className="flex flex-col gap-6 text-white">
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
        <div className="skeleton h-4 w-40 rounded-full" />
        <div className="skeleton h-24 w-24 rounded-full" />
        <div className="skeleton h-12 w-28 rounded-xl" />
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="skeleton h-3 w-64 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur"
          >
            <div className="skeleton h-2.5 w-16 rounded-full" />
            <div className="skeleton h-5 w-20 rounded-md" />
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
        <div className="skeleton mb-4 h-1.5 w-full rounded-full" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex shrink-0 flex-col items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3"
            >
              <div className="skeleton h-3 w-8 rounded-full" />
              <div className="skeleton h-9 w-9 rounded-full" />
              <div className="skeleton h-3 w-6 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
        <div className="skeleton mb-3 h-4 w-44 rounded-full" />
        <div className="skeleton h-72 w-full rounded-xl" />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur"
          >
            <div className="skeleton h-4 w-24 self-start rounded-full" />
            <div className="skeleton h-28 w-28 rounded-full" />
            <div className="skeleton h-3 w-32 rounded-full" />
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
        <div className="skeleton mb-3 h-4 w-28 rounded-full" />
        <div className="flex flex-col divide-y divide-white/10">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3">
              <div className="skeleton h-3 w-10 rounded-full" />
              <div className="skeleton h-7 w-7 rounded-full" />
              <div className="skeleton h-3 flex-1 rounded-full" />
              <div className="skeleton h-3 w-8 rounded-full" />
              <div className="skeleton h-1 w-20 rounded-full" />
              <div className="skeleton h-3 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}