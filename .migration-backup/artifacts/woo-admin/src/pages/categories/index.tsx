import { useState, useEffect } from "react"
import {
  useListCategories,
  getListCategoriesQueryKey,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@workspace/api-client-react"
import type { Category } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ImageUploader, type UploadedImage } from "@/components/image-uploader"
import { Search, Plus, Edit, Trash2, Loader2, Tags } from "lucide-react"
import { toast } from "sonner"

function CategoryModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: Category | null
}) {
  const queryClient = useQueryClient()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const [name, setName] = useState(editing?.name ?? "")
  const [slug, setSlug] = useState(editing?.slug ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")
  const [categoryImage, setCategoryImage] = useState<UploadedImage[]>([])

  useEffect(() => {
    setName(editing?.name ?? "")
    setSlug(editing?.slug ?? "")
    setDescription(editing?.description ?? "")
    setCategoryImage(
      editing?.image?.src
        ? [{ id: editing.image.id ?? 0, src: editing.image.src, alt: editing.name }]
        : []
    )
  }, [editing?.id])

  const isPending = createCategory.isPending || updateCategory.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }
    const imagePayload = categoryImage[0]
      ? { image: { id: categoryImage[0].id, src: categoryImage[0].src } }
      : editing && editing.image
      ? { image: { id: 0, src: "" } }
      : {}

    try {
      if (editing) {
        await updateCategory.mutateAsync({
          id: editing.id,
          data: {
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim(),
            ...imagePayload,
          },
        })
        toast.success("Category updated")
      } else {
        await createCategory.mutateAsync({
          data: {
            name: name.trim(),
            slug: slug.trim() || undefined,
            description: description.trim(),
            ...imagePayload,
          },
        })
        toast.success("Category created")
      }
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() })
      onClose()
    } catch {
      toast.error(editing ? "Failed to update category" : "Failed to create category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cat-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Outerwear"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">
              Slug{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. outerwear"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-desc">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Short category description..."
            />
          </div>
          <div className="space-y-2">
            <Label>
              Category Image{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <ImageUploader
              images={categoryImage}
              onChange={setCategoryImage}
              maxImages={1}
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Categories() {
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Category | null>(null)

  const { data, isLoading } = useListCategories({ page: 1, per_page: 100, search })
  const deleteCategory = useDeleteCategory()
  const queryClient = useQueryClient()

  const categories = Array.isArray(data) ? data : []

  const openCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const openEdit = (cat: Category) => {
    setEditTarget(cat)
    setModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteCategory.mutateAsync({ id })
      toast.success(`"${name}" deleted`)
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() })
    } catch {
      toast.error("Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage product taxonomy and organisation.</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead className="text-right w-16">Products</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading categories...
                  </div>
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Tags className="h-8 w-8 opacity-30" />
                    <p>No categories found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="group">
                  <TableCell>
                    {category.image?.src ? (
                      <img
                        src={category.image.src}
                        alt={category.name}
                        className="w-9 h-9 object-cover rounded bg-muted"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-muted rounded flex items-center justify-center">
                        <Tags className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-sm">
                    {category.slug}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-xs truncate">
                    {category.description ? (
                      category.description.replace(/<[^>]+>/g, "")
                    ) : (
                      <span className="opacity-40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{category.count}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(category)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{category.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the category. Products will not be
                              deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(category.id, category.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editTarget}
      />
    </div>
  )
}
