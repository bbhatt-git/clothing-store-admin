import { useState } from "react"
import { useListOrders, getListOrdersQueryKey, useUpdateOrder } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "wouter"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"

export default function Orders() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading } = useListOrders({ page, per_page: 20, search })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 hover:bg-green-600 text-white'
      case 'processing': return 'bg-amber-500 hover:bg-amber-600 text-white'
      case 'cancelled': return 'bg-red-500 hover:bg-red-600 text-white'
      case 'pending': return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'on-hold': return 'bg-gray-500 hover:bg-gray-600 text-white'
      case 'refunded': return 'bg-purple-500 hover:bg-purple-600 text-white'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">Manage customer orders and fulfillment.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders (by ID, email, name)..."
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
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
              </TableRow>
            ) : data?.orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
              </TableRow>
            ) : (
              data?.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.number}</TableCell>
                  <TableCell>{new Date(order.date_created || "").toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className={`capitalize rounded-none ${getStatusColor(order.status)}`}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{order.billing?.first_name} {order.billing?.last_name}</span>
                      <span className="text-xs text-muted-foreground">{order.billing?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{order.currency_symbol}{order.total}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
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
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
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
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
