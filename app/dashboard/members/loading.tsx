export default function MembersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-neutral-800 rounded"></div>
          <div className="h-5 w-64 bg-neutral-800 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-neutral-800 rounded"></div>
      </div>

      {/* Table skeleton */}
      <div className="bg-neutral-800 rounded-lg p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-neutral-700 rounded"></div>
        ))}
      </div>
    </div>
  )
}
