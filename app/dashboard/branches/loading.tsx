export default function BranchesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-neutral-800 rounded"></div>
          <div className="h-5 w-64 bg-neutral-800 rounded"></div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-neutral-800 rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}
