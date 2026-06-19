export default function ShopLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      {/* Skeleton Header */}
      <div className="h-16 bg-white border-b border-[#121212]/10 animate-pulse" />

      <main className="flex-grow px-6 md:px-10 pt-8 md:pt-12 pb-8 md:pb-12">
        <div className="max-w-[1560px] mx-auto">
          
          {/* Skeleton Page Title */}
          <div className="mb-8 md:mb-12 space-y-4">
            <div className="h-4 bg-stone-200 rounded w-48 animate-pulse" />
            <div className="h-12 md:h-16 bg-stone-200 rounded w-3/4 md:w-1/2 animate-pulse" />
            <div className="h-4 bg-stone-200 rounded w-full max-w-xl animate-pulse" />
          </div>

          {/* Skeleton Filter and Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Skeleton Filters Sidebar */}
            <div className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="h-8 bg-stone-200 rounded w-1/2 animate-pulse mb-4" />
              <div className="space-y-3">
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
              </div>
              
              <div className="h-8 bg-stone-200 rounded w-1/2 animate-pulse mb-4 mt-8" />
              <div className="space-y-3">
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
              </div>

              <div className="h-8 bg-stone-200 rounded w-1/2 animate-pulse mb-4 mt-8" />
              <div className="space-y-3">
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
                <div className="h-10 bg-stone-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Skeleton Product Grid */}
            <div className="lg:col-span-9">
              {/* Mobile Filter Bar Skeleton */}
              <div className="lg:hidden flex items-center gap-2 bg-white p-3 rounded-[4px] border border-[#121212]/5 shadow-sm mb-6">
                <div className="h-8 bg-stone-200 rounded flex-1 animate-pulse" />
                <div className="h-8 bg-stone-200 rounded flex-1 animate-pulse" />
              </div>

              {/* Skeleton Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex flex-col h-full">
                    {/* Skeleton Image */}
                    <div className="aspect-[3/4] bg-stone-200 rounded-lg mb-3 md:mb-5 animate-pulse" />
                    
                    {/* Skeleton Title */}
                    <div className="h-4 bg-stone-200 rounded w-3/4 mb-2 animate-pulse" />
                    
                    {/* Skeleton Price */}
                    <div className="h-4 bg-stone-200 rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}