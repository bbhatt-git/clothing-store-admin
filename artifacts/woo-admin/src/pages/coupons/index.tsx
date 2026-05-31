import { useState } from "react"
import { useListCoupons, getListCouponsQueryKey, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function Coupons() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListCoupons({ page, per_page: 20, search })
  const deleteCoupon = useDeleteCoupon()
  const queryClient = useQueryClient()

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return
    try {
      await deleteCoupon.mutateAsync({ id })
      toast.success("Coupon deleted")
      queryClient.invalidateQueries({ queryKey: getListCouponsQueryKey() })
    } catch (error) {
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
        <Button className="gap-2" onClick={() => toast("Create coupon modal to be implemented")}>
          <Plus className="h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
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
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading coupons...</TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No coupons found.</TableCell>
              </TableRow>
            ) : (
              data?.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                  <TableCell className="capitalize">{coupon.discount_type?.replace('_', ' ')}</TableCell>
                  <TableCell>{coupon.amount}</TableCell>
                  <TableCell>
                    {coupon.usage_count} / {coupon.usage_limit || '∞'}
                  </TableCell>
                  <TableCell>
                    {coupon.date_expires ? new Date(coupon.date_expires).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(coupon.id)}>
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
