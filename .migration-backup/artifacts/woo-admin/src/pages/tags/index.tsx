import { useState, useEffect } from "react"
import {
  useListTags,
  getListTagsQueryKey,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from "@workspace/api-client-react"
import type { WooTag } from "@workspace/api-client-react"
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
import { Search, Plus, Edit, Trash2, Loader2, Hash } from "lucide-react"
import { toast } from "sonner"

function TagModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: WooTag | null
}) {
  const queryClient = useQueryClient()
  const createTag = useCreateTag()
  const updateTag = useUpdateTag()

  const [name, setName] = useState(editing?.name ?? "")
  const [slug, setSlug] = useState(editing?.slug ?? "")
  const [description, setDescription] = useState("")

  useEffect(() => {
    setName(editing?.name ?? "")
    setSlug(editing?.slug ?? "")
    setDescription("")
  }, [editing?.id])

  const isPending = createTag.isPending || updateTag.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Tag name is required")
      return
    }
    try {
      if (editing) {
        await updateTag.mutateAsync({
          id: editing.id,
          data: { name: name.trim(), slug: slug.trim() || undefined, description },
        })
        toast.success("Tag updated")
      } else {
        await createTag.mutateAsync({
          data: { name: name.trim(), slug: slug.trim() || undefined, description },
        })
        toast.success("Tag created")
      }
      queryClient.invalidateQueries({ queryKey: getListTagsQueryKey() })
      onClose()
    } catch {
      toast.error(editing ? "Failed to update tag" : "Failed to create tag")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Tag" : "Add Tag"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="tag-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tag-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New Arrival"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag-slug">
              Slug <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="tag-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. new-arrival"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag-desc">
              Description <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Textarea
              id="tag-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Tag description..."
            />
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Create Tag"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Tags() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WooTag | null>(null)

  const { data, isLoading } = useListTags({ page, per_page: 20, search })
  const deleteTag = useDeleteTag()
  const queryClient = useQueryClient()

  const tags = data?.tags ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const openCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const openEdit = (tag: WooTag) => {
    setEditTarget(tag)
    setModalOpen(true)
  }

  const handleDelete = async (id: number, name: string) => {
    try {
      await deleteTag.mutateAsync({ id })
      toast.success(`"${name}" deleted`)
      queryClient.invalidateQueries({ queryKey: getListTagsQueryKey() })
    } catch {
      toast.error("Failed to delete tag")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Tags</h2>
          <p className="text-muted-foreground">
            {total > 0 ? `${total} tags` : "Manage product tags for filtering and organisation."}
          </p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Tag
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tags..."
          className="pl-8"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Slug</TableHead>
              <TableHead className="text-right w-20">Products</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading tags...
                  </div>
                </TableCell>
              </TableRow>
            ) : tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Hash className="h-8 w-8 opacity-30" />
                    <p>No tags found.</p>
                    <Button variant="outline" size="sm" onClick={openCreate} className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Create your first tag
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {tag.name}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground font-mono text-sm">
                    {tag.slug}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {tag.count ?? 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(tag)}
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
                            <AlertDialogTitle>Delete "{tag.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the tag. Products using this tag will not
                              be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(tag.id, tag.name)}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <TagModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editTarget}
      />
    </div>
  )
}
