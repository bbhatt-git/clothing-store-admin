import { useState } from "react"
import {
  useListReviews,
  getListReviewsQueryKey,
  useUpdateReview,
  useDeleteReview,
} from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Star, Check, X, Trash2, Loader2, MessageSquare } from "lucide-react"
import { toast } from "sonner"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={`star-${i}`}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-primary text-primary"
              : "fill-transparent text-muted-foreground/40"
          }`}
        />
      ))}
    </div>
  )
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "approved") return "default"
  if (status === "hold") return "secondary"
  if (status === "spam" || status === "trash") return "destructive"
  return "outline"
}

export default function Reviews() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("all")

  const queryParams = { page, per_page: 20, ...(status !== "all" ? { status } : {}) }
  const { data, isLoading } = useListReviews(queryParams)

  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()
  const queryClient = useQueryClient()

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey(queryParams) })

  const handleApprove = async (id: number) => {
    try {
      await updateReview.mutateAsync({ id, data: { status: "approved" } })
      toast.success("Review approved")
      invalidate()
    } catch {
      toast.error("Failed to approve review")
    }
  }

  const handleSpam = async (id: number) => {
    try {
      await updateReview.mutateAsync({ id, data: { status: "spam" } })
      toast.success("Review marked as spam")
      invalidate()
    } catch {
      toast.error("Failed to update review")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteReview.mutateAsync({ id })
      toast.success("Review deleted")
      invalidate()
    } catch {
      toast.error("Failed to delete review")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
          <p className="text-muted-foreground">Manage product reviews and customer feedback.</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="hold">Pending</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="trash">Trash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead className="hidden sm:table-cell">Product</TableHead>
              <TableHead className="w-24">Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="text-right w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading reviews...
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 opacity-30" />
                    <p>No reviews found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((review) => (
                <TableRow key={review.id} className="group align-top">
                  <TableCell>
                    <div className="font-medium text-sm leading-tight">{review.reviewer}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[140px]">
                      {review.reviewer_email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {review.product_name}
                  </TableCell>
                  <TableCell>
                    <StarRating rating={review.rating ?? 0} />
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {review.review?.replace(/<[^>]+>/g, "") || "—"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(review.status ?? "")} className="capitalize text-xs">
                      {review.status === "hold" ? "Pending" : review.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {review.status !== "approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Approve"
                          onClick={() => handleApprove(review.id)}
                          disabled={updateReview.isPending}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {review.status !== "spam" && review.status !== "trash" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          title="Mark as spam"
                          onClick={() => handleSpam(review.id)}
                          disabled={updateReview.isPending}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Review by {review.reviewer} will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
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
    </div>
  )
}
