import { useState } from "react"
import { useListOrders } from "@workspace/api-client-react"
import { Link } from "wouter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Loader2, ShoppingCart } from "lucide-react"

function OrderStatusBadge({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    completed:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    processing: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    cancelled:  "bg-red-500/15 text-red-400 border-red-500/30",
    pending:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
    "on-hold":  "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    refunded:   "bg-purple-500/15 text-purple-400 border-purple-500/30",
    failed:     "bg-red-500/15 text-red-400 border-red-500/30",
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium border capitalize ${cfg[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  )
}

export default function Orders() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListOrders({ page, per_page: 20, search })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Manage customer orders and fulfillment.</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by ID, email, name..."
          className="pl-8"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="hidden sm:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right w-16">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading orders...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.orders.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ShoppingCart className="h-8 w-8 opacity-30" />
                    <p>No orders found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.orders.map((order) => (
                <TableRow key={order.id} className="group hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium font-mono">#{order.number}</TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {order.date_created
                      ? new Date(order.date_created).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status ?? ""} />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="text-sm font-medium leading-tight">
                      {order.billing?.first_name} {order.billing?.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">{order.billing?.email}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {order.currency_symbol}{order.total}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
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
