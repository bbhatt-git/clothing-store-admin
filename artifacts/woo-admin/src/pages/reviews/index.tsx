import { useState } from "react"
import { useListReviews, getListReviewsQueryKey, useUpdateReview, useDeleteReview } from "@workspace/api-client-react"
import { useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Check, X, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function Reviews() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>("all")
  
  const queryParams = { page, per_page: 20, ...(status !== "all" ? { status } : {}) }
  const { data, isLoading } = useListReviews(queryParams)
  
  const updateReview = useUpdateReview()
  const deleteReview = useDeleteReview()
  const queryClient = useQueryClient()

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateReview.mutateAsync({ id, data: { status: newStatus } })
      toast.success(`Review ${newStatus}`)
      queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey(queryParams) })
    } catch (error) {
      toast.error("Failed to update review status")
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this review?")) return
    try {
      await deleteReview.mutateAsync({ id })
      toast.success("Review deleted")
      queryClient.invalidateQueries({ queryKey: getListReviewsQueryKey(queryParams) })
    } catch (error) {
      toast.error("Failed to delete review")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reviews</h2>
          <p className="text-muted-foreground">Manage product reviews and feedback.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="hold">Pending</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="trash">Trash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reviewer</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="w-[40%]">Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading reviews...</TableCell>
              </TableRow>
            ) : data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reviews found.</TableCell>
              </TableRow>
            ) : (
              data?.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="font-medium">{review.reviewer}</div>
                    <div className="text-xs text-muted-foreground">{review.reviewer_email}</div>
                  </TableCell>
                  <TableCell>{review.product_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < (review.rating || 0) ? 'fill-current' : 'text-muted stroke-current'}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm line-clamp-2" dangerouslySetContent={{ __html: review.review || '' }} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={review.status === 'approved' ? 'default' : 'secondary'} className="capitalize rounded-none">
                      {review.status === 'hold' ? 'pending' : review.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {review.status !== 'approved' && (
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleUpdateStatus(review.id, 'approved')}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {review.status !== 'spam' && review.status !== 'trash' && (
                      <Button variant="ghost" size="icon" className="text-amber-600 hover:text-amber-700" onClick={() => handleUpdateStatus(review.id, 'spam')}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(review.id)}>
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
