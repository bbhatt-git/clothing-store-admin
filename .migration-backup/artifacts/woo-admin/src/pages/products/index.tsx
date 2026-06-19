import { useState } from "react"
import { useListProducts, getListProductsQueryKey, useDeleteProduct } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Loader2, Package } from "lucide-react"
import { toast } from "sonner"
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

export default function Products() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListProducts({ page, per_page: 20, search })
  const deleteProduct = useDeleteProduct()
  const queryClient = useQueryClient()

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct.mutateAsync({ id })
      toast.success("Product deleted")
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
    } catch {
      toast.error("Failed to delete product")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">Manage your store's products and inventory.</p>
        </div>
        <Link href="/products/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          className="pl-8"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden sm:table-cell">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading products...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.products.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-8 w-8 opacity-30" />
                    <p>No products found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.products.map((product) => (
                <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell>
                    {product.images?.[0]?.src ? (
                      <img
                        src={product.images[0].src}
                        alt={product.name}
                        className="w-9 h-9 object-cover rounded bg-muted"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-muted rounded flex items-center justify-center">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-sm leading-tight">{product.name}</div>
                    {product.type === "variable" && (
                      <div className="text-xs text-muted-foreground mt-0.5">Variable product</div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm font-mono text-muted-foreground">
                    {product.sku || <span className="opacity-40">—</span>}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums text-sm">
                    {product.price ? `$${product.price}` : <span className="text-muted-foreground opacity-40">—</span>}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    <span className={
                      product.stock_status === "instock"
                        ? "text-emerald-400"
                        : "text-destructive"
                    }>
                      {product.stock_quantity !== null
                        ? product.stock_quantity
                        : product.stock_status === "instock" ? "In stock" : "Out of stock"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.status === "publish" ? "default" : "secondary"}
                      className="capitalize text-xs"
                    >
                      {product.status === "publish" ? "Live" : product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/products/${product.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete "{product.name}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the product and all its data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
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

      {data?.totalPages && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
