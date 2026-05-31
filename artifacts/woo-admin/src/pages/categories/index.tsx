import { useState } from "react"
import { useListCategories, getListCategoriesQueryKey, useDeleteCategory } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export default function Categories() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListCategories({ page, per_page: 50, search })
  const deleteCategory = useDeleteCategory()
  const queryClient = useQueryClient()

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      await deleteCategory.mutateAsync({ id })
      toast.success("Category deleted")
      queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() })
    } catch (error) {
      toast.error("Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">Manage product taxonomy and organization.</p>
        </div>
        <Button className="gap-2" onClick={() => toast("Category form modal to be implemented")}>
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading categories...</TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No categories found.</TableCell>
              </TableRow>
            ) : (
              data?.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    {category.image?.src ? (
                      <img src={category.image.src} alt={category.name} className="w-10 h-10 object-cover rounded bg-muted" />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">No img</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-[200px]" dangerouslySetContent={{ __html: category.description || '-' }} />
                  <TableCell>{category.slug}</TableCell>
                  <TableCell className="text-right">{category.count}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => toast("Edit category modal to be implemented")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
