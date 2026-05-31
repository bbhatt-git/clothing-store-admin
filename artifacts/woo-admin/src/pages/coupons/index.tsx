import { useState, useEffect } from "react"
import {
  useListCoupons,
  getListCouponsQueryKey,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
} from "@workspace/api-client-react"
import type { Coupon } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Search, Plus, Edit, Trash2, Loader2, Ticket } from "lucide-react"
import { toast } from "sonner"

const DISCOUNT_TYPES = [
  { value: "percent", label: "Percentage discount" },
  { value: "fixed_cart", label: "Fixed cart discount" },
  { value: "fixed_product", label: "Fixed product discount" },
]

function discountLabel(type?: string) {
  return DISCOUNT_TYPES.find((d) => d.value === type)?.label ?? type ?? "—"
}

function formatAmount(coupon: Coupon) {
  if (!coupon.amount) return "—"
  if (coupon.discount_type === "percent") return `${coupon.amount}%`
  return `$${coupon.amount}`
}

// ── Form modal ──────────────────────────────────────────────────────────────
function CouponModal({
  open,
  onClose,
  editing,
}: {
  open: boolean
  onClose: () => void
  editing: Coupon | null
}) {
  const queryClient = useQueryClient()
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon()

  const [code, setCode] = useState(editing?.code ?? "")
  const [discountType, setDiscountType] = useState(editing?.discount_type ?? "percent")
  const [amount, setAmount] = useState(editing?.amount ?? "")
  const [usageLimit, setUsageLimit] = useState<number | "">(editing?.usage_limit ?? "")
  const [usageLimitPerUser, setUsageLimitPerUser] = useState<number | "">(editing?.usage_limit_per_user ?? "")
  const [dateExpires, setDateExpires] = useState(
    editing?.date_expires ? editing.date_expires.split("T")[0] : ""
  )
  const [freeShipping, setFreeShipping] = useState(editing?.free_shipping ?? false)
  const [individualUse, setIndividualUse] = useState(editing?.individual_use ?? false)
  const [minimumAmount, setMinimumAmount] = useState(editing?.minimum_amount ?? "")

  // Reset form when editing target changes
  useEffect(() => {
    setCode(editing?.code ?? "")
    setDiscountType(editing?.discount_type ?? "percent")
    setAmount(editing?.amount ?? "")
    setUsageLimit(editing?.usage_limit ?? "")
    setUsageLimitPerUser(editing?.usage_limit_per_user ?? "")
    setDateExpires(editing?.date_expires ? editing.date_expires.split("T")[0] : "")
    setFreeShipping(editing?.free_shipping ?? false)
    setIndividualUse(editing?.individual_use ?? false)
    setMinimumAmount(editing?.minimum_amount ?? "")
  }, [editing?.id])

  const isPending = createCoupon.isPending || updateCoupon.isPending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error("Coupon code is required")
      return
    }
    const payload = {
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      amount: amount as string,
      usage_limit: usageLimit === "" ? undefined : Number(usageLimit),
      usage_limit_per_user: usageLimitPerUser === "" ? undefined : Number(usageLimitPerUser),
      date_expires: dateExpires ? `${dateExpires}T00:00:00` : undefined,
      free_shipping: freeShipping,
      individual_use: individualUse,
      minimum_amount: minimumAmount as string || undefined,
    }

    try {
      if (editing) {
        await updateCoupon.mutateAsync({ id: editing.id, data: payload })
        toast.success("Coupon updated")
      } else {
        await createCoupon.mutateAsync({ data: payload })
        toast.success("Coupon created")
      }
      queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() })
      onClose()
    } catch {
      toast.error(editing ? "Failed to update coupon" : "Failed to create coupon")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cpn-code">Code <span className="text-destructive">*</span></Label>
            <Input
              id="cpn-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20"
              className="font-mono"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpn-type">Discount Type</Label>
              <Select value={discountType} onValueChange={setDiscountType}>
                <SelectTrigger id="cpn-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpn-amount">
                Amount {discountType === "percent" ? "(%)" : "($)"}
              </Label>
              <Input
                id="cpn-amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={discountType === "percent" ? "10" : "5.00"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpn-min">Minimum Order ($)</Label>
              <Input
                id="cpn-min"
                type="number"
                step="0.01"
                min="0"
                value={minimumAmount}
                onChange={(e) => setMinimumAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpn-expires">Expiry Date</Label>
              <Input
                id="cpn-expires"
                type="date"
                value={dateExpires}
                onChange={(e) => setDateExpires(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpn-limit">Usage Limit (total)</Label>
              <Input
                id="cpn-limit"
                type="number"
                min="0"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpn-limit-user">Per User Limit</Label>
              <Input
                id="cpn-limit-user"
                type="number"
                min="0"
                value={usageLimitPerUser}
                onChange={(e) => setUsageLimitPerUser(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="cpn-freeship" className="cursor-pointer">Free shipping</Label>
              <Switch id="cpn-freeship" checked={freeShipping} onCheckedChange={setFreeShipping} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="cpn-individual" className="cursor-pointer">Individual use only</Label>
              <Switch id="cpn-individual" checked={individualUse} onCheckedChange={setIndividualUse} />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save Changes" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Coupons() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Coupon | null>(null)

  const { data, isLoading } = useListCoupons({ page, per_page: 20, search })
  const deleteCoupon = useDeleteCoupon()
  const queryClient = useQueryClient()

  const openCreate = () => {
    setEditTarget(null)
    setModalOpen(true)
  }

  const openEdit = (coupon: Coupon) => {
    setEditTarget(coupon)
    setModalOpen(true)
  }

  const handleDelete = async (id: number, code: string) => {
    try {
      await deleteCoupon.mutateAsync({ id })
      toast.success(`Coupon "${code}" deleted`)
      queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() })
    } catch {
      toast.error("Failed to delete coupon")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Coupons</h2>
          <p className="text-muted-foreground">Manage discount codes and promotions.</p>
        </div>
        <Button className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search coupons..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden md:table-cell">Usage</TableHead>
              <TableHead className="hidden lg:table-cell">Expires</TableHead>
              <TableHead className="hidden lg:table-cell">Flags</TableHead>
              <TableHead className="text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading coupons...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Ticket className="h-8 w-8 opacity-30" />
                    <p>No coupons found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((coupon) => (
                <TableRow key={coupon.id} className="group">
                  <TableCell>
                    <span className="font-mono font-semibold tracking-wide">{coupon.code}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {discountLabel(coupon.discount_type)}
                  </TableCell>
                  <TableCell className="font-medium">{formatAmount(coupon)}</TableCell>
                  <TableCell className="hidden md:table-cell tabular-nums text-sm">
                    <span>{coupon.usage_count ?? 0}</span>
                    <span className="text-muted-foreground"> / {coupon.usage_limit ?? "∞"}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {coupon.date_expires
                      ? new Date(coupon.date_expires).toLocaleDateString()
                      : <span className="text-muted-foreground">Never</span>
                    }
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {coupon.free_shipping && (
                        <Badge variant="secondary" className="text-xs">Free ship</Badge>
                      )}
                      {coupon.individual_use && (
                        <Badge variant="secondary" className="text-xs">Individual</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => openEdit(coupon)}
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
                            <AlertDialogTitle>Delete coupon "{coupon.code}"?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this coupon. Customers already using it will no longer be able to apply it.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(coupon.id, coupon.code)}
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

      {data && data.length === 20 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <CouponModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editTarget}
      />
    </div>
  )
}
