import { useState } from "react"
import { useParams, useLocation } from "wouter"
import {
  useGetOrder,
  getGetOrderQueryKey,
  useUpdateOrder,
  getListOrdersQueryKey,
} from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  ArrowLeft,
  Loader2,
  User,
  MapPin,
  CreditCard,
  Package,
  Truck,
  Tag,
  MessageSquare,
  Receipt,
} from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  processing: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "on-hold": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/15 text-red-400 border-red-500/20",
  refunded: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  failed: "bg-rose-500/15 text-rose-400 border-rose-500/20",
}

export default function OrderDetail() {
  const { id } = useParams()
  const orderId = parseInt(id || "0")
  const [, setLocation] = useLocation()
  const queryClient = useQueryClient()
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: {
      enabled: !!orderId,
      queryKey: getGetOrderQueryKey(orderId),
    },
  })

  const updateOrder = useUpdateOrder()

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true)
    try {
      await updateOrder.mutateAsync({ id: orderId, data: { status: newStatus } })
      toast.success("Order status updated")
      queryClient.setQueryData(getGetOrderQueryKey(orderId), (old: unknown) =>
        old && typeof old === "object" ? { ...old, status: newStatus } : old
      )
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() })
    } catch {
      toast.error("Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading order...
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-muted-foreground">Order not found.</div>
    )
  }

  const o = order as typeof order & {
    shipping_lines?: Array<{ id: number; method_title: string; method_id: string; total: string; total_tax: string }>
    coupon_lines?: Array<{ id: number; code: string; discount: string; discount_tax: string }>
    fee_lines?: Array<{ id: number; name: string; total: string; total_tax: string }>
    transaction_id?: string
    customer_id?: number
    payment_method?: string
  }

  const statusClass = STATUS_COLORS[o.status] ?? "bg-secondary text-secondary-foreground border-border"
  const sym = o.currency_symbol || "$"

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/orders")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Order #{o.number}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">
              {new Date(o.date_created || "").toLocaleString()} · {o.currency}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${statusClass}`}>
            {o.status}
          </span>
          <Select value={o.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
            <SelectTrigger className="w-[180px]">
              {updatingStatus ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Updating...
                </div>
              ) : (
                <SelectValue placeholder="Update status" />
              )}
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {o.line_items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image?.src ? (
                            <img
                              src={item.image.src}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded bg-muted shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded shrink-0 flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-medium truncate">{item.name}</div>
                            {item.sku && (
                              <div className="text-xs text-muted-foreground font-mono">
                                SKU: {item.sku}
                              </div>
                            )}
                            {item.meta_data?.filter(m => m.key && !m.key.startsWith("_")).map(m => (
                              <div key={m.id} className="text-xs text-muted-foreground">
                                {m.key}: {typeof m.value === "string" ? m.value : JSON.stringify(m.value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{sym}{Number(item.price ?? 0).toFixed(2)}</TableCell>
                      <TableCell className="text-right tabular-nums">×{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">{sym}{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-muted-foreground" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="tabular-nums">{sym}{o.subtotal}</span>
                </div>
                {o.shipping_lines?.map((sl) => (
                  <div key={sl.id} className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      {sl.method_title}
                    </span>
                    <span className="tabular-nums">{sym}{sl.total}</span>
                  </div>
                ))}
                {(!o.shipping_lines || o.shipping_lines.length === 0) && Number(o.shipping_total) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" />
                      Shipping
                    </span>
                    <span className="tabular-nums">{sym}{o.shipping_total}</span>
                  </div>
                )}
                {o.coupon_lines?.map((cl) => (
                  <div key={cl.id} className="flex justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Coupon: <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">{cl.code}</code>
                    </span>
                    <span className="text-emerald-400 tabular-nums">-{sym}{cl.discount}</span>
                  </div>
                ))}
                {(!o.coupon_lines || o.coupon_lines.length === 0) && Number(o.discount_total) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-emerald-400 tabular-nums">-{sym}{o.discount_total}</span>
                  </div>
                )}
                {o.fee_lines?.map((fl) => (
                  <div key={fl.id} className="flex justify-between">
                    <span className="text-muted-foreground">{fl.name}</span>
                    <span className="tabular-nums">{sym}{fl.total}</span>
                  </div>
                ))}
                {Number(o.total_tax) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="tabular-nums">{sym}{o.total_tax}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="tabular-nums">{sym}{o.total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {o.payment_method && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span>{o.payment_method_title || o.payment_method}</span>
                  </div>
                  {o.transaction_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-mono text-xs">{o.transaction_id}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-semibold tabular-nums">{sym}{o.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {o.customer_note && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Customer Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic text-muted-foreground bg-muted px-4 py-3 rounded-md border border-border">
                  "{o.customer_note}"
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="font-semibold">
                  {o.billing?.first_name} {o.billing?.last_name}
                </div>
                {o.customer_id ? (
                  <div className="text-xs text-muted-foreground">Customer #{o.customer_id}</div>
                ) : (
                  <div className="text-xs text-muted-foreground">Guest</div>
                )}
                {o.billing?.email && (
                  <a
                    href={`mailto:${o.billing.email}`}
                    className="text-sm text-primary hover:underline block mt-1"
                  >
                    {o.billing.email}
                  </a>
                )}
                {o.billing?.phone && (
                  <a
                    href={`tel:${o.billing.phone}`}
                    className="text-sm text-muted-foreground hover:underline block"
                  >
                    {o.billing.phone}
                  </a>
                )}
                {o.billing?.company && (
                  <div className="text-sm text-muted-foreground">{o.billing.company}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Billing
                </h4>
                <address className="not-italic text-sm text-muted-foreground space-y-0.5">
                  {o.billing?.address_1 && <div>{o.billing.address_1}</div>}
                  {o.billing?.address_2 && <div>{o.billing.address_2}</div>}
                  {(o.billing?.city || o.billing?.state || o.billing?.postcode) && (
                    <div>
                      {[o.billing.city, o.billing.state, o.billing.postcode]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                  {o.billing?.country && <div>{o.billing.country}</div>}
                </address>
              </div>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Shipping
                </h4>
                {o.shipping?.address_1 ? (
                  <address className="not-italic text-sm text-muted-foreground space-y-0.5">
                    {o.shipping?.address_1 && <div>{o.shipping.address_1}</div>}
                    {o.shipping?.address_2 && <div>{o.shipping.address_2}</div>}
                    {(o.shipping?.city || o.shipping?.state || o.shipping?.postcode) && (
                      <div>
                        {[o.shipping.city, o.shipping.state, o.shipping.postcode]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                    {o.shipping?.country && <div>{o.shipping.country}</div>}
                  </address>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Same as billing</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span>#{o.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-xs">
                    {new Date(o.date_created || "").toLocaleDateString()}
                  </span>
                </div>
                {o.date_modified && o.date_modified !== o.date_created && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Modified</span>
                    <span className="text-xs">
                      {new Date(o.date_modified).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {o.payment_method && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span>{o.payment_method_title || o.payment_method}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
