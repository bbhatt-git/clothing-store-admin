import { useState, useEffect, useRef } from "react"
import { useParams, useLocation } from "wouter"
import { useGetProduct, getGetProductQueryKey, useUpdateProduct, useListProductVariations, getListProductVariationsQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"

export default function ProductEdit() {
  const { id } = useParams()
  const productId = parseInt(id || "0")
  const [location, setLocation] = useLocation()
  const queryClient = useQueryClient()

  const { data: product, isLoading } = useGetProduct(productId, {
    query: {
      enabled: !!productId,
      queryKey: getGetProductQueryKey(productId)
    }
  })

  const { data: variations } = useListProductVariations(productId, {
    query: {
      enabled: !!productId && product?.type === "variable",
      queryKey: getListProductVariationsQueryKey(productId)
    }
  })

  const updateProduct = useUpdateProduct()

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
          stock_quantity: stockQuantity === "" ? undefined : Number(stockQuantity)
        }
      })
      toast.success("Product updated")
      queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(productId) })
    } catch (error) {
      toast.error("Failed to update product")
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading product...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/products")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        </div>
        <Button onClick={handleSave} className="gap-2" disabled={updateProduct.isPending}>
          <Save className="h-4 w-4" />
          {updateProduct.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Leather Jacket" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={6} />
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Pricing</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regularPrice">Regular Price ($)</Label>
                <Input id="regularPrice" type="number" step="0.01" value={regularPrice} onChange={e => setRegularPrice(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price ($)</Label>
                <Input id="salePrice" type="number" step="0.01" value={salePrice} onChange={e => setSalePrice(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Inventory</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="manageStock" checked={manageStock} onCheckedChange={setManageStock} />
                <Label htmlFor="manageStock">Track stock quantity</Label>
              </div>
              {manageStock && (
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input id="stockQuantity" type="number" value={stockQuantity} onChange={e => setStockQuantity(e.target.value === "" ? "" : Number(e.target.value))} />
                </div>
              )}
            </div>
          </div>
          
          {product?.type === 'variable' && (
             <div className="bg-card border rounded-lg p-6 space-y-4">
               <h3 className="font-semibold text-lg">Variations ({variations?.length || 0})</h3>
               <div className="text-sm text-muted-foreground">Variations management to be fully implemented.</div>
             </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">Status</h3>
            <div className="space-y-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
