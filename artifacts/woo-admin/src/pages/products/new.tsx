import { useState } from "react"
import { useLocation } from "wouter"
import {
  useCreateProduct,
  useListCategories,
  getListProductsQueryKey,
} from "@workspace/api-client-react"
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
  Loader2,
  Plus,
  Trash2,
  Check,
  ChevronsUpDown,
  X,
  DollarSign,
  Package,
  Layers,
} from "lucide-react"

interface AttributeRow {
  id: string
  name: string
  options: string[]
  variation: boolean
  visible: boolean
}

export default function ProductNew() {
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const createProduct = useCreateProduct()

  const { data: categoriesData } = useListCategories({ per_page: 100 })
  const allCategories = categoriesData ?? []

  const [name, setName] = useState("")
  const [productType, setProductType] = useState<"simple" | "variable">("simple")
  const [status, setStatus] = useState("draft")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")

  const [regularPrice, setRegularPrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [sku, setSku] = useState("")
  const [manageStock, setManageStock] = useState(false)
  const [stockQuantity, setStockQuantity] = useState<number | "">("")
  const [stockStatus, setStockStatus] = useState("instock")

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([])
  const [catOpen, setCatOpen] = useState(false)

  const [tagInput, setTagInput] = useState("")
  const [tagNames, setTagNames] = useState<string[]>([])

  const [images, setImages] = useState<UploadedImage[]>([])

  const [attributes, setAttributes] = useState<AttributeRow[]>([])
  const [newAttrName, setNewAttrName] = useState("")
  const [newAttrOptions, setNewAttrOptions] = useState("")

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const addAttribute = () => {
    if (!newAttrName.trim() || !newAttrOptions.trim()) return
    const options = newAttrOptions
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
    if (!options.length) return
    setAttributes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: newAttrName.trim(),
        options,
        variation: true,
        visible: true,
      },
    ])
    setNewAttrName("")
    setNewAttrOptions("")
  }

  const removeAttribute = (id: string) => {
    setAttributes((prev) => prev.filter((a) => a.id !== id))
  }

  const addTag = () => {
    const trimmed = tagInput.trim()
    if (trimmed && !tagNames.includes(trimmed)) {
      setTagNames((prev) => [...prev, trimmed])
    }
    setTagInput("")
  }

  const removeTag = (name: string) => {
    setTagNames((prev) => prev.filter((t) => t !== name))
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Product name is required")
      return
    }

    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        type: productType,
        status,
        description,
        short_description: shortDescription,
        categories: selectedCategoryIds.map((id) => ({ id })),
        tags: tagNames.map((n) => ({ name: n })),
        images: images.map((img) => ({ id: img.id, src: img.src })),
      }

      if (productType === "simple") {
        if (regularPrice) payload.regular_price = regularPrice
        if (salePrice) payload.sale_price = salePrice
        if (sku) payload.sku = sku
        payload.manage_stock = manageStock
        if (manageStock && stockQuantity !== "") payload.stock_quantity = Number(stockQuantity)
        payload.stock_status = stockStatus
      } else {
        payload.attributes = attributes.map((attr) => ({
          id: 0,
          name: attr.name,
          options: attr.options,
          variation: attr.variation,
          visible: attr.visible,
        }))
      }

      const res = await createProduct.mutateAsync({ data: payload as never })
      toast.success("Product created")
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
      setLocation(`/products/${res.id}/edit`)
    } catch {
      toast.error("Failed to create product")
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
            <p className="text-muted-foreground text-sm mt-0.5 capitalize">{productType} product</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={createProduct.isPending} className="gap-2">
          {createProduct.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {createProduct.isPending ? "Creating..." : "Create Product"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-md p-6 space-y-2">
            <Label htmlFor="prod-name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="prod-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Classic Leather Jacket"
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
                  Detailed description shown in the product description tab
                </p>
              </div>
              <RichEditor
                value={description}
                onChange={setDescription}
                placeholder="Detailed product description, materials, care instructions..."
                minHeight="220px"
              />
            </div>
          </div>

          {productType === "simple" && (
            <>
              <div className="bg-card border border-border rounded-md p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-price">Regular Price ($)</Label>
                    <Input
                      id="reg-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={regularPrice}
                      onChange={(e) => setRegularPrice(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sale-price">Sale Price ($)</Label>
                    <Input
                      id="sale-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      placeholder="0.00"
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
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. JACKET-BLK-001"
                  />
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
                  <Switch id="manage-stock" checked={manageStock} onCheckedChange={setManageStock} />
                  <Label htmlFor="manage-stock">Track stock quantity</Label>
                </div>
                {manageStock && (
                  <div className="space-y-2">
                    <Label htmlFor="stock-qty">Stock Quantity</Label>
                    <Input
                      id="stock-qty"
                      type="number"
                      min="0"
                      value={stockQuantity}
                      onChange={(e) =>
                        setStockQuantity(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="0"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {productType === "variable" && (
            <div className="bg-card border border-border rounded-md p-6 space-y-4">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Attributes
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Define attributes (e.g. Size, Color) used for variations. After saving, manage
                  individual variations on the edit page.
                </p>
              </div>

              {attributes.length > 0 && (
                <div className="space-y-2">
                  {attributes.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-start gap-3 p-3 bg-muted/40 rounded-md border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{attr.name}</div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {attr.options.map((opt) => (
                            <span
                              key={opt}
                              className="px-2 py-0.5 bg-background border border-border text-xs rounded-full"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Switch
                            checked={attr.variation}
                            onCheckedChange={(v) =>
                              setAttributes((prev) =>
                                prev.map((a) => (a.id === attr.id ? { ...a, variation: v } : a))
                              )
                            }
                            className="scale-75"
                          />
                          <span className="text-xs text-muted-foreground">For variations</span>
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => removeAttribute(attr.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 items-end">
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newAttrName}
                    onChange={(e) => setNewAttrName(e.target.value)}
                    placeholder="e.g. Color"
                    onKeyDown={(e) => e.key === "Enter" && addAttribute()}
                  />
                </div>
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs">
                    Values{" "}
                    <span className="text-muted-foreground font-normal">(comma-separated)</span>
                  </Label>
                  <Input
                    value={newAttrOptions}
                    onChange={(e) => setNewAttrOptions(e.target.value)}
                    placeholder="e.g. Red, Blue, Green"
                    onKeyDown={(e) => e.key === "Enter" && addAttribute()}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                  className="gap-1.5 shrink-0"
                  disabled={!newAttrName.trim() || !newAttrOptions.trim()}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>

              {attributes.length === 0 && (
                <div className="text-sm text-muted-foreground border border-dashed border-border rounded-md p-4 text-center">
                  No attributes yet. Add at least one attribute to enable variations.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-md p-4 space-y-3">
            <h3 className="font-semibold text-sm">Product Type</h3>
            <Select
              value={productType}
              onValueChange={(v: "simple" | "variable") => setProductType(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple Product</SelectItem>
                <SelectItem value="variable">Variable Product</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {productType === "simple"
                ? "Single product with one price and stock level."
                : "Product with multiple variants (size, color, etc.)."}
            </p>
          </div>

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
                          onSelect={() => {
                            toggleCategory(cat.id)
                          }}
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
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Type a tag..."
                className="text-sm h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                  if (e.key === ",") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTag}
                disabled={!tagInput.trim()}
                className="h-8"
              >
                Add
              </Button>
            </div>
            {tagNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tagNames.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Press Enter or comma to add. New tags are auto-created.
            </p>
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
