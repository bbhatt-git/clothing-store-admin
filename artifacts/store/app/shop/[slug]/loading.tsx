export default function ProductLoading() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F0]">
      {/* Skeleton Header */}
      <div className="h-16 bg-white border-b border-[#121212]/10 animate-pulse" />

      <main className="flex-grow px-6 md:px-10 py-8 md:py-12">
        <div className="max-w-[1560px] mx-auto">
          
          {/* Skeleton Product Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start bg-white p-6 md:p-10 rounded-[4px] border border-stone-200 shadow-sm">
            
            {/* Skeleton Product Images */}
            <div className="lg:col-span-6 space-y-4">
              {/* Skeleton Main Image */}
              <div className="aspect-[3/4] bg-stone-200 rounded-[4px] animate-pulse" />
              
              {/* Skeleton Thumbnails */}
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-20 aspect-[3/4] bg-stone-200 rounded-[4px] animate-pulse" />
                ))}
              </div>
            </div>

            {/* Skeleton Product Information */}
            <div className="lg:col-span-6 space-y-8">
              {/* Skeleton Title */}
              <div className="space-y-4">
                <div className="h-10 md:h-16 bg-stone-200 rounded w-3/4 animate-pulse" />
              </div>

              {/* Skeleton Price */}
              <div className="border-y border-stone-200 py-6 space-y-4">
                <div className="h-10 bg-stone-200 rounded w-1/3 animate-pulse" />
                <div className="h-6 bg-stone-200 rounded w-1/4 animate-pulse" />
              </div>

              {/* Skeleton Description */}
              <div className="space-y-2">
                <div className="h-4 bg-stone-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-stone-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
              </div>

              {/* Skeleton Size Selector */}
              <div className="space-y-3">
                <div className="h-4 bg-stone-200 rounded w-1/4 animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-12 h-12 bg-stone-200 rounded-[4px] animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Skeleton Color Selector */}
              <div className="space-y-3">
                <div className="h-4 bg-stone-200 rounded w-1/4 animate-pulse" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-16 h-11 bg-stone-200 rounded-[4px] animate-pulse" />
                  ))}
                </div>
              </div>

              {/* Skeleton Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="h-14 bg-stone-200 rounded-[4px] w-36 animate-pulse" />
                <div className="h-14 bg-stone-200 rounded-[4px] flex-1 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Skeleton Reviews Section */}
          <div className="mt-12">
            <div className="bg-white border border-stone-200 rounded-[4px] p-6 md:p-8 shadow-sm">
              <div className="h-8 bg-stone-200 rounded w-1/3 mb-6 animate-pulse" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-stone-100 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-stone-200 rounded-full animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 bg-stone-200 rounded w-24 animate-pulse" />
                        <div className="h-3 bg-stone-200 rounded w-32 animate-pulse" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-stone-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-stone-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-stone-200 rounded w-3/4 animate-pulse" />
                    </div>
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