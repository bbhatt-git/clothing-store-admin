import { useState, useEffect, useRef } from "react"
import { useParams, useLocation } from "wouter"
import {
  useGetProduct,
  getGetProductQueryKey,
  useUpdateProduct,
  useListProductVariations,
  getListProductVariationsQueryKey,
  useUpdateProductVariation,
  useCreateProductVariation,
  useDeleteProductVariation,
} from "@workspace/api-client-react"
import type { ProductVariation } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Save, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from "lucide-react"

// ── Variation row ────────────────────────────────────────────────────────────
function VariationRow({
  variation,
  productId,
  onSaved,
  onDeleted,
}: {
  variation: ProductVariation
  productId: number
  onSaved: () => void
  onDeleted: () => void
}) {
  const [open, setOpen] = useState(false)
  const [regularPrice, setRegularPrice] = useState(variation.regular_price ?? "")
  const [salePrice, setSalePrice] = useState(variation.sale_price ?? "")
  const [sku, setSku] = useState(variation.sku ?? "")
  const [manageStock, setManageStock] = useState(variation.manage_stock ?? false)
  const [stockQty, setStockQty] = useState<number | "">(variation.stock_quantity ?? "")
  const [status, setStatus] = useState(variation.status ?? "publish")

  const updateVariation = useUpdateProductVariation()
  const deleteVariation = useDeleteProductVariation()

  const label = variation.attributes?.map((a) => a.option).join(" / ") || `#${variation.id}`

  const handleSave = async () => {
    try {
      await updateVariation.mutateAsync({
        id: productId,
        variationId: variation.id,
        data: {
          regular_price: regularPrice as string,
          sale_price: salePrice as string,
          sku: sku as string,
          manage_stock: manageStock,
          stock_quantity: stockQty === "" ? undefined : Number(stockQty),
          status,
        },
      })
      toast.success(`Variation "${label}" saved`)
      onSaved()
    } catch {
      toast.error("Failed to save variation")
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete variation "${label}"?`)) return
    try {
      await deleteVariation.mutateAsync({ id: productId, variationId: variation.id })
      toast.success("Variation deleted")
      onDeleted()
    } catch {
      toast.error("Failed to delete variation")
    }
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{label}</span>
          {variation.regular_price && (
            <span className="text-muted-foreground">${variation.regular_price}</span>
          )}
          {variation.sku && (
            <Badge variant="secondary" className="text-xs font-mono">{variation.sku}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={variation.stock_status === "instock" ? "default" : "destructive"}
            className="text-xs"
          >
            {variation.stock_status === "instock" ? "In Stock" : "Out of Stock"}
          </Badge>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20 space-y-4">
          {/* Attributes read-only */}
          {variation.attributes && variation.attributes.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {variation.attributes.map((attr) => (
                <div key={attr.id} className="text-xs px-2 py-1 bg-muted rounded-md">
                  <span className="text-muted-foreground">{attr.name}: </span>
                  <span className="font-medium">{attr.option}</span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Regular Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sale Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">SKU</Label>
              <Input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. JACKET-BLK-M"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Enabled</SelectItem>
                  <SelectItem value="private">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch
                id={`manage-stock-${variation.id}`}
                checked={manageStock}
                onCheckedChange={setManageStock}
              />
              <Label htmlFor={`manage-stock-${variation.id}`} className="text-xs">Track stock quantity</Label>
            </div>
            {manageStock && (
              <div className="space-y-1.5">
                <Label className="text-xs">Stock Quantity</Label>
                <Input
                  type="number"
                  value={stockQty}
                  onChange={(e) => setStockQty(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive gap-1.5"
              onClick={handleDelete}
              disabled={deleteVariation.isPending}
            >
              {deleteVariation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateVariation.isPending}
              className="gap-1.5"
            >
              {updateVariation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Variation
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main edit page ───────────────────────────────────────────────────────────
export default function ProductEdit() {
  const { id } = useParams()
  const productId = parseInt(id || "0")
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) },
  })

  const { data: variations, isLoading: variationsLoading } = useListProductVariations(productId, {
    query: {
      enabled: !!productId && product?.type === "variable",
      queryKey: getListProductVariationsQueryKey(productId),
    },
  })

  const updateProduct = useUpdateProduct()
  const createVariation = useCreateProductVariation()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [regularPrice, setRegularPrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [sku, setSku] = useState("")
  const [status, setStatus] = useState("draft")
  const [manageStock, setManageStock] = useState(false)
  const [stockQuantity, setStockQuantity] = useState<number | "">("")

  const initRef = useRef<number | null>(null)
  useEffect(() => {
    if (product && initRef.current !== productId) {
      initRef.current = productId
      setName(product.name || "")
      setDescription(product.description || "")
      setRegularPrice(product.regular_price || "")
      setSalePrice(product.sale_price || "")
      setSku(product.sku || "")
      setStatus(product.status || "draft")
      setManageStock(product.manage_stock || false)
      setStockQuantity(product.stock_quantity ?? "")
    }
  }, [product, productId])

  const handleSave = async () => {
    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: {
          name,
          description,
          regular_price: regularPrice,
          sale_price: salePrice,
          sku,
          status,
          manage_stock: manageStock,
          stock_quantity: stockQuantity === "" ? undefined : Number(stockQuantity),
        },
      })
      toast.success("Product updated")
      queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) })
    } catch {
      toast.error("Failed to update product")
    }
  }

  const handleAddVariation = async () => {
    try {
      await createVariation.mutateAsync({
        id: productId,
        data: { status: "publish" },
      })
      toast.success("New variation added")
      queryClient.invalidateQueries({ queryKey: getListProductVariationsQueryKey(productId) })
    } catch {
      toast.error("Failed to add variation")
    }
  }

  const refreshVariations = () => {
    queryClient.invalidateQueries({ queryKey: getListProductVariationsQueryKey(productId) })
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading product...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            {product?.type && (
              <p className="text-sm text-muted-foreground capitalize mt-0.5">Type: {product.type}</p>
            )}
          </div>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={updateProduct.isPending}>
          {updateProduct.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {updateProduct.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Core info */}
          <div className="bg-card border border-border rounded-md p-6 space-y-4">
            <h3 className="font-semibold">Product Details</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Leather Jacket" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
            </div>
          </div>

          {/* Pricing — only for simple products */}
          {product?.type !== "variable" && (
            <div className="bg-card border border-border rounded-md p-6 space-y-4">
              <h3 className="font-semibold">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regularPrice">Regular Price ($)</Label>
                  <Input id="regularPrice" type="number" step="0.01" value={regularPrice} onChange={(e) => setRegularPrice(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price ($)</Label>
                  <Input id="salePrice" type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Inventory — only for simple products */}
          {product?.type !== "variable" && (
            <div className="bg-card border border-border rounded-md p-6 space-y-4">
              <h3 className="font-semibold">Inventory</h3>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="manageStock" checked={manageStock} onCheckedChange={setManageStock} />
                <Label htmlFor="manageStock">Track stock quantity</Label>
              </div>
              {manageStock && (
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                </div>
              )}
            </div>
          )}

          {/* Variations — for variable products */}
          {product?.type === "variable" && (
            <div className="bg-card border border-border rounded-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Variations</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {variationsLoading ? "Loading..." : `${variations?.length ?? 0} variation${variations?.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddVariation}
                  disabled={createVariation.isPending}
                  className="gap-1.5"
                >
                  {createVariation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Add Variation
                </Button>
              </div>

              {variationsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading variations...
                </div>
              ) : variations && variations.length > 0 ? (
                <div className="space-y-2">
                  {variations.map((v) => (
                    <VariationRow
                      key={v.id}
                      variation={v}
                      productId={productId}
                      onSaved={refreshVariations}
                      onDeleted={refreshVariations}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground py-4 border border-dashed border-border rounded-md text-center">
                  No variations yet. Click "Add Variation" to create one.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-md p-6 space-y-4">
            <h3 className="font-semibold">Status</h3>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="publish">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {product && (
            <div className="bg-card border border-border rounded-md p-6 space-y-3">
              <h3 className="font-semibold">Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span>#{product.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{product.type}</span>
                </div>
                {product.price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price</span>
                    <span>${product.price}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className={product.stock_status === "instock" ? "text-green-500" : "text-destructive"}>
                    {product.stock_status === "instock" ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
