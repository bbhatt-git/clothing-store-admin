import { useParams, useLocation } from "wouter"
import { useGetOrder, getGetOrderQueryKey, useUpdateOrder, getListOrdersQueryKey } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function OrderDetail() {
  const { id } = useParams()
  const orderId = parseInt(id || "0")
  const [location, setLocation] = useLocation()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: {
      enabled: !!orderId,
      queryKey: getGetOrderQueryKey(orderId)
    }
  })

  const updateOrder = useUpdateOrder()

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateOrder.mutateAsync({
        id: orderId,
        data: { status: newStatus }
      })
      toast.success("Order status updated")
      queryClient.setQueryData(getGetOrderQueryKey(orderId), (old: any) => 
        old ? { ...old, status: newStatus } : old
      )
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() })
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading order details...</div>
  }

  if (!order) {
    return <div className="p-8 text-center text-muted-foreground">Order not found.</div>
  }

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
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Order #{order.number}</h2>
            <p className="text-muted-foreground">{new Date(order.date_created || "").toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={`px-3 py-1 capitalize rounded-none ${getStatusColor(order.status)}`}>
            {order.status}
          </Badge>
          <Select value={order.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending payment</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="on-hold">On hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.line_items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image?.src && (
                            <img src={item.image.src} alt={item.name} className="w-10 h-10 object-cover rounded bg-muted" />
                          )}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{order.currency_symbol}{item.price}</TableCell>
                      <TableCell className="text-right">x{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">{order.currency_symbol}{item.total}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                    <TableCell className="text-right">{order.currency_symbol}{order.subtotal}</TableCell>
                  </TableRow>
                  {Number(order.discount_total) > 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium text-muted-foreground">Discount</TableCell>
                      <TableCell className="text-right text-muted-foreground">-{order.currency_symbol}{order.discount_total}</TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium text-muted-foreground">Shipping</TableCell>
                    <TableCell className="text-right text-muted-foreground">{order.currency_symbol}{order.shipping_total}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium text-muted-foreground">Tax</TableCell>
                    <TableCell className="text-right text-muted-foreground">{order.currency_symbol}{order.total_tax}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                    <TableCell className="text-right font-bold text-lg">{order.currency_symbol}{order.total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-medium">{order.billing?.first_name} {order.billing?.last_name}</div>
                <div className="text-sm text-muted-foreground">
                  <a href={`mailto:${order.billing?.email}`} className="hover:underline text-primary">{order.billing?.email}</a>
                </div>
                {order.billing?.phone && (
                  <div className="text-sm text-muted-foreground">
                    <a href={`tel:${order.billing?.phone}`} className="hover:underline">{order.billing?.phone}</a>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Billing Address</h4>
                <address className="not-italic text-sm text-muted-foreground space-y-1">
                  <div>{order.billing?.address_1}</div>
                  {order.billing?.address_2 && <div>{order.billing?.address_2}</div>}
                  <div>{order.billing?.city}, {order.billing?.state} {order.billing?.postcode}</div>
                  <div>{order.billing?.country}</div>
                </address>
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-2">Shipping Address</h4>
                <address className="not-italic text-sm text-muted-foreground space-y-1">
                  <div>{order.shipping?.address_1}</div>
                  {order.shipping?.address_2 && <div>{order.shipping?.address_2}</div>}
                  <div>{order.shipping?.city}, {order.shipping?.state} {order.shipping?.postcode}</div>
                  <div>{order.shipping?.country}</div>
                </address>
              </div>
            </CardContent>
          </Card>
          
          {order.customer_note && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic text-muted-foreground bg-muted p-3 rounded">"{order.customer_note}"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
