export default function Loading() {
  return (
    <div className="flex h-screen bg-slate-50">
      <div className="w-64 bg-white border-r border-slate-200"></div>
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-slate-200"></div>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </main>
      </div>
    </div>
  )
}
