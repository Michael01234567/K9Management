export function AppLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-900 mx-auto"></div>
        <p className="text-stone-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}
