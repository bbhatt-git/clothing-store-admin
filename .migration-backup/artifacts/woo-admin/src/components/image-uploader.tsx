import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, ImageIcon, Loader2, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export interface UploadedImage {
  id: number
  src: string
  alt: string
}

interface ImageUploaderProps {
  images: UploadedImage[]
  onChange: (images: UploadedImage[]) => void
  maxImages?: number
}

const TOKEN_KEY = "admin_token"

async function uploadFile(file: File): Promise<UploadedImage> {
  const token = localStorage.getItem(TOKEN_KEY)
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/media/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Upload failed" }))
    throw new Error((err as { error?: string }).error ?? "Upload failed")
  }

  const data = (await response.json()) as { id: number; url: string; title?: string }
  return { id: data.id, src: data.url, alt: data.title ?? "" }
}

export function ImageUploader({ images, onChange, maxImages = 10 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const remaining = maxImages - images.length
    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }
    const toUpload = Array.from(files).slice(0, remaining)
    setUploading(true)
    const results: UploadedImage[] = []
    for (const file of toUpload) {
      try {
        const uploaded = await uploadFile(file)
        results.push(uploaded)
      } catch {
        toast.error(`Failed to upload ${file.name}`)
      }
    }
    if (results.length) onChange([...images, ...results])
    setUploading(false)
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const setFeatured = (index: number) => {
    if (index === 0) return
    const next = [...images]
    const [img] = next.splice(index, 1)
    next.unshift(img)
    onChange(next)
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={`${img.id}-${i}`}
              className="group relative aspect-square rounded-md overflow-hidden border border-border bg-muted"
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-semibold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Main
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setFeatured(i)}
                    title="Set as main image"
                    className="h-7 w-7 bg-white/90 hover:bg-white text-gray-800 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  title="Remove image"
                  className="h-7 w-7 bg-white/90 hover:bg-white text-red-600 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < maxImages && (
        <div
          className={cn(
            "border-2 border-dashed rounded-md p-6 flex flex-col items-center gap-2 cursor-pointer transition-all",
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-border hover:border-primary/50 hover:bg-muted/20"
          )}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragOver(true)
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            handleFiles(e.dataTransfer.files)
          }}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Drop images here</p>
                <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <Button type="button" variant="outline" size="sm" className="gap-1.5 mt-1">
                <Upload className="h-3.5 w-3.5" />
                Choose Files
              </Button>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          First image is featured. Hover to reorder or remove.
        </p>
      )}
    </div>
  )
}
