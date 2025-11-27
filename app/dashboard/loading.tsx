export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-20 bg-neutral-800 rounded-lg"></div>
      
      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-neutral-800 rounded-lg"></div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="h-96 bg-neutral-800 rounded-lg"></div>
    </div>
  )
}
