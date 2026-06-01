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
  useListCategories,
  useListTags,
} from "@workspace/api-client-react"
import type { ProductVariation } from "@workspace/api-client-react"

interface AttributeRow {
  id: string
  name: string
  options: string[]
  variation: boolean
  visible: boolean
}
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { RichEditor } from "@/components/rich-editor"
import { ImageUploader, type UploadedImage } from "@/components/image-uploader"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Save,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  X,
  DollarSign,
  Package,
  Layers,
  Zap,
  ExternalLink,
} from "lucide-react"

function cartesian(arrays: string[][]): string[][] {
  return arrays.reduce<string[][]>(
    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
    [[]]
  )
}

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
      toast.success(`"${label}" saved`)
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
    <div className="border border-border rounded-md overflow-hidden transition-colors">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium">{label}</span>
          {variation.regular_price && (
            <span className="text-muted-foreground">${variation.regular_price}</span>
          )}
          {variation.sku && (
            <Badge variant="secondary" className="text-xs font-mono">
              {variation.sku}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={variation.stock_status === "instock" ? "default" : "destructive"}
            className="text-xs"
          >
            {variation.stock_status === "instock" ? "In Stock" : "Out of Stock"}
          </Badge>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20 space-y-4">
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
                placeholder="e.g. SHIRT-RED-M"
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Switch
                id={`ms-${variation.id}`}
                checked={manageStock}
                onCheckedChange={setManageStock}
              />
              <Label htmlFor={`ms-${variation.id}`} className="text-xs">
                Track stock
              </Label>
            </div>
            {manageStock && (
              <div className="space-y-1.5">
                <Label className="text-xs">Stock Quantity</Label>
                <Input
                  type="number"
                  value={stockQty}
                  onChange={(e) =>
                    setStockQty(e.target.value === "" ? "" : Number(e.target.value))
                  }
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
              {deleteVariation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Delete
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateVariation.isPending} className="gap-1.5">
              {updateVariation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

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
  const { data: categoriesData } = useListCategories({ per_page: 100 })
  const allCategories = categoriesData ?? []

  const updateProduct = useUpdateProduct()
  const createVariation = useCreateProductVariation()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [regularPrice, setRegularPrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [sku, setSku] = useState("")
  const [status, setStatus] = useState("draft")
  const [manageStock, setManageStock] = useState(false)
  const [stockQuantity, setStockQuantity] = useState<number | "">("")
  const [stockStatus, setStockStatus] = useState("instock")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [catOpen, setCatOpen] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [tagNames, setTagNames] = useState<string[]>([])
  const [tagOpen, setTagOpen] = useState(false)
  const [images, setImages] = useState<UploadedImage[]>([])
  const [generatingVariations, setGeneratingVariations] = useState(false)
  const [editableAttributes, setEditableAttributes] = useState<AttributeRow[]>([])
  const [newAttrName, setNewAttrName] = useState("")
  const [newAttrOptions, setNewAttrOptions] = useState("")

  const { data: tagsData } = useListTags({ per_page: 100 })
  const allTags = tagsData?.tags ?? []

  const initRef = useRef<number | null>(null)
  useEffect(() => {
    if (product && initRef.current !== productId) {
      initRef.current = productId
      setName(product.name || "")
      setDescription(product.description || "")
      setShortDescription(product.short_description || "")
      setRegularPrice(product.regular_price || "")
      setSalePrice(product.sale_price || "")
      setSku(product.sku || "")
      setStatus(product.status || "draft")
      setManageStock(product.manage_stock || false)
      setStockQuantity(product.stock_quantity ?? "")
      setStockStatus((product as unknown as Record<string, unknown>).stock_status as string || "instock")
      setSelectedCategoryIds(product.categories?.map((c) => c.id).filter((id): id is number => id !== undefined) ?? [])
      setTagNames(product.tags?.map((t) => t.name) ?? [])
      setEditableAttributes(
        product.attributes?.map((a) => ({
          id: crypto.randomUUID(),
          name: a.name ?? "",
          options: a.options ?? [],
          variation: a.variation ?? false,
          visible: a.visible ?? true,
        })) ?? []
      )
      setImages(
        product.images?.map((img) => ({
          id: img.id ?? 0,
          src: img.src ?? "",
          alt: img.alt ?? img.name ?? "",
        })) ?? []
      )
    }
  }, [product, productId])

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const addTag = (name?: string) => {
    const trimmed = (name ?? tagInput).trim()
    if (trimmed && !tagNames.includes(trimmed)) setTagNames((prev) => [...prev, trimmed])
    setTagInput("")
    setTagOpen(false)
  }

  const removeTag = (name: string) => setTagNames((prev) => prev.filter((t) => t !== name))

  const addAttribute = () => {
    if (!newAttrName.trim() || !newAttrOptions.trim()) return
    const options = newAttrOptions.split(",").map((v) => v.trim()).filter(Boolean)
    if (!options.length) return
    setEditableAttributes((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newAttrName.trim(), options, variation: true, visible: true },
    ])
    setNewAttrName("")
    setNewAttrOptions("")
  }

  const removeAttribute = (id: string) => {
    setEditableAttributes((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSave = async () => {
    try {
      await updateProduct.mutateAsync({
        id: productId,
        data: {
          name,
          description,
          short_description: shortDescription,
          regular_price: regularPrice,
          sale_price: salePrice,
          sku,
          status,
          manage_stock: manageStock,
          stock_quantity: stockQuantity === "" ? undefined : Number(stockQuantity),
          stock_status: stockStatus,
          categories: selectedCategoryIds.map((id) => ({ id })),
          tags: tagNames.map((n) => ({ name: n } as never)),
          images: images.map((img) => ({ id: img.id, src: img.src })),
          attributes: editableAttributes.map((a, i) => ({
            name: a.name,
            position: i,
            visible: a.visible,
            variation: a.variation,
            options: a.options,
          })),
        } as never,
      })
      toast.success("Product updated")
      queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) })
    } catch {
      toast.error("Failed to update product")
    }
  }

  const handleAddVariation = async () => {
    try {
      await createVariation.mutateAsync({ id: productId, data: { status: "publish" } })
      toast.success("Variation added")
      queryClient.invalidateQueries({ queryKey: getListProductVariationsQueryKey(productId) })
    } catch {
      toast.error("Failed to add variation")
    }
  }

  const handleGenerateAllVariations = async () => {
    const attrs = product?.attributes?.filter((a) => a.variation && a.options?.length)
    if (!attrs?.length) {
      toast.error("No variation attributes defined on this product")
      return
    }
    const combos = cartesian(attrs.map((a) => a.options ?? []))
    if (combos.length > 50) {
      toast.error("Too many combinations (max 50). Reduce attribute options.")
      return
    }
    setGeneratingVariations(true)
    let created = 0
    for (const combo of combos) {
      try {
        await createVariation.mutateAsync({
          id: productId,
          data: {
            status: "publish",
            attributes: attrs.map((attr, i) => ({ id: 0, name: attr.name, option: combo[i] })),
          },
        })
        created++
      } catch {
        // skip duplicates silently
      }
    }
    queryClient.invalidateQueries({ queryKey: getListProductVariationsQueryKey(productId) })
    setGeneratingVariations(false)
    toast.success(`Generated ${created} variation${created !== 1 ? "s" : ""}`)
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
            {product?.type && (
              <p className="text-sm text-muted-foreground capitalize mt-0.5">
                {product.type} product · #{product.id}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {product?.slug && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                window.open(`${window.location.origin.replace(window.location.port ? `:${window.location.port}` : "", "")}/?p=${product.id}`, "_blank")
              }
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View
            </Button>
          )}
          <Button onClick={handleSave} disabled={updateProduct.isPending} className="gap-2">
            {updateProduct.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {updateProduct.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-md p-6 space-y-2">
            <Label htmlFor="edit-name">Product Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="bg-card border border-border rounded-md p-6 space-y-6">
            <div className="space-y-2">
              <div>
                <Label>Short Description</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Brief summary shown below the product title
                </p>
              </div>
              <RichEditor
                value={shortDescription}
                onChange={setShortDescription}
                placeholder="Brief product summary..."
                minHeight="100px"
              />
            </div>
            <div className="space-y-2">
              <div>
                <Label>Full Description</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Shown in the product description tab
                </p>
              </div>
              <RichEditor
                value={description}
                onChange={setDescription}
                placeholder="Detailed product description..."
                minHeight="220px"
              />
            </div>
          </div>

          {product?.type !== "variable" && (
            <>
              <div className="bg-card border border-border rounded-md p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Regular Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Sale Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-md p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Inventory
                </h3>
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Stock Status</Label>
                  <Select value={stockStatus} onValueChange={setStockStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instock">In Stock</SelectItem>
                      <SelectItem value="outofstock">Out of Stock</SelectItem>
                      <SelectItem value="onbackorder">On Backorder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="edit-ms" checked={manageStock} onCheckedChange={setManageStock} />
                  <Label htmlFor="edit-ms">Track stock quantity</Label>
                </div>
                {manageStock && (
                  <div className="space-y-2">
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) =>
                        setStockQuantity(e.target.value === "" ? "" : Number(e.target.value))
                      }
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="bg-card border border-border rounded-md p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              Attributes
            </h3>
            {editableAttributes.length > 0 && (
              <div className="space-y-2">
                {editableAttributes.map((attr) => (
                  <div key={attr.id} className="flex items-start gap-2 p-3 bg-muted/40 rounded-md border border-border">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1.5">{attr.name}</div>
                      <div className="flex flex-wrap gap-1">
                        {attr.options.map((opt) => (
                          <span key={opt} className="px-2 py-0.5 bg-background border border-border text-xs rounded-full">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                    {attr.variation && (
                      <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">Variations</Badge>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeAttribute(attr.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 items-start">
              <Input
                placeholder="Attribute name (e.g. Size)"
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
                className="text-sm h-8 flex-1"
              />
              <Input
                placeholder="Options, comma-separated (e.g. S,M,L)"
                value={newAttrOptions}
                onChange={(e) => setNewAttrOptions(e.target.value)}
                className="text-sm h-8 flex-1"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAttribute() } }}
              />
              <Button type="button" variant="outline" size="sm" onClick={addAttribute} className="h-8 shrink-0">
                Add
              </Button>
            </div>
          </div>

          {product?.type === "variable" && (
            <>

              <div className="bg-card border border-border rounded-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Variations</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {variationsLoading
                        ? "Loading..."
                        : `${variations?.length ?? 0} variation${variations?.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.attributes?.some((a) => a.variation) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleGenerateAllVariations}
                        disabled={generatingVariations}
                        className="gap-1.5"
                      >
                        {generatingVariations ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Zap className="h-3.5 w-3.5" />
                        )}
                        Generate All
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleAddVariation}
                      disabled={createVariation.isPending}
                      className="gap-1.5"
                    >
                      {createVariation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      Add
                    </Button>
                  </div>
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
                  <div className="text-sm text-muted-foreground py-6 border border-dashed border-border rounded-md text-center">
                    No variations yet. Click "Generate All" to create from attributes, or "Add" to
                    add one manually.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-md p-4 space-y-3">
            <h3 className="font-semibold text-sm">Status</h3>
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
            <div className="bg-card border border-border rounded-md p-4 space-y-2">
              <h3 className="font-semibold text-sm">Info</h3>
              <div className="space-y-1.5 text-sm">
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
                  <span
                    className={
                      product.stock_status === "instock" ? "text-green-500" : "text-destructive"
                    }
                  >
                    {product.stock_status === "instock" ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                {product.date_modified && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modified</span>
                    <span className="text-xs">
                      {new Date(product.date_modified).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-md p-4 space-y-3">
            <h3 className="font-semibold text-sm">Categories</h3>
            <Popover open={catOpen} onOpenChange={setCatOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between font-normal text-sm"
                  size="sm"
                >
                  {selectedCategoryIds.length > 0
                    ? `${selectedCategoryIds.length} selected`
                    : "Select categories..."}
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search..." />
                  <CommandList>
                    <CommandEmpty>No categories found.</CommandEmpty>
                    <CommandGroup>
                      {allCategories.map((cat) => (
                        <CommandItem
                          key={cat.id}
                          value={cat.name}
                          onSelect={() => toggleCategory(cat.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategoryIds.includes(cat.id) ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {cat.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedCategoryIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {allCategories
                  .filter((c) => selectedCategoryIds.includes(c.id))
                  .map((cat) => (
                    <Badge key={cat.id} variant="secondary" className="gap-1 text-xs pr-1">
                      {cat.name}
                      <button
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className="ml-0.5 hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-md p-4 space-y-3">
            <h3 className="font-semibold text-sm">Tags</h3>
            <Popover open={tagOpen} onOpenChange={setTagOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal text-sm" size="sm">
                  {tagInput || "Search or add a tag..."}
                  <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Type a tag..."
                    value={tagInput}
                    onValueChange={setTagInput}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {tagInput.trim() ? (
                        <button
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => addTag(tagInput.trim())}
                        >
                          Create &quot;{tagInput.trim()}&quot;
                        </button>
                      ) : (
                        "Type to search or create a tag"
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {allTags
                        .filter((t) => !tagNames.includes(t.name ?? ""))
                        .filter((t) => !tagInput || t.name?.toLowerCase().includes(tagInput.toLowerCase()))
                        .map((t) => (
                          <CommandItem key={t.id} value={t.name} onSelect={() => addTag(t.name ?? "")}>
                            {t.name}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {tagNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tagNames.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs pr-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-md p-4 space-y-3">
            <h3 className="font-semibold text-sm">Product Images</h3>
            <ImageUploader images={images} onChange={setImages} />
          </div>
        </div>
      </div>
    </div>
  )
}
