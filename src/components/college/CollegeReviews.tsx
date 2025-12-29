"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, ThumbsUp, ThumbsDown, Calendar, X, RefreshCw, ExternalLink, MapPin, Globe, Image as ImageIcon, Video, CheckCircle2, MessageSquare } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Review {
  id: number
  rating: number
  title: string | null
  review: string
  reviewerName: string | null
  course: string | null
  batch: string | null
  category: string | null
  helpfulCount: number
  notHelpfulCount: number
  photos: string[]
  videoUrl: string | null
  isVerified: boolean
  replyFromCollege: string | null
  replyDate: string | null
  createdAt: string
  source: string | null
  externalUrl: string | null
  externalDate: string | null
}

interface CollegeReviewsProps {
  collegeSlug: string
}

export function CollegeReviews({ collegeSlug }: CollegeReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingCounts, setRatingCounts] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [formData, setFormData] = useState({
    rating: "",
    title: "",
    review: "",
    reviewerName: "",
    reviewerEmail: "",
    course: "",
    batch: "",
    category: "",
  })

  const reviewCategories = [
    { value: "academics", label: "Academics" },
    { value: "infrastructure", label: "Infrastructure" },
    { value: "placements", label: "Placements" },
    { value: "campus_life", label: "Campus Life" },
    { value: "faculty", label: "Faculty" },
  ]

  useEffect(() => {
    fetchReviews()
  }, [collegeSlug])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/colleges/${collegeSlug}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
        setTotalReviews(data.totalReviews || 0)
        setRatingCounts(data.ratingCounts || {})
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSyncExternal = async () => {
    try {
      setSyncing(true)
      const response = await fetch(`/api/colleges/${collegeSlug}/reviews/sync-external`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        showNotification(
          data.message || `Synced ${data.synced} external reviews`,
          "success"
        )
        // Refresh reviews after sync
        fetchReviews()
      } else {
        const error = await response.json()
        showNotification(error.error || "Failed to sync external reviews", "error")
      }
    } catch (error) {
      console.error("Error syncing external reviews:", error)
      showNotification("Failed to sync external reviews", "error")
    } finally {
      setSyncing(false)
    }
  }

  const getSourceBadge = (source: string | null) => {
    if (!source || source === "internal") return null

    const sourceConfig = {
      google_maps: { label: "Google Maps", icon: MapPin, color: "bg-blue-100 text-blue-800" },
      college_website: { label: "College Website", icon: Globe, color: "bg-green-100 text-green-800" },
      internet: { label: "Internet", icon: ExternalLink, color: "bg-purple-100 text-purple-800" },
    }

    const config = sourceConfig[source as keyof typeof sourceConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.rating || !formData.review) {
      showNotification("Please provide a rating and review text", "error")
      return
    }

    try {
      const response = await fetch(`/api/colleges/${collegeSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        showNotification("Review submitted! It will be published after admin approval.", "success")
        setFormData({
          rating: "",
          title: "",
          review: "",
          reviewerName: "",
          reviewerEmail: "",
          course: "",
          batch: "",
          category: "",
        })
        setShowForm(false)
        fetchReviews()
      } else {
        const error = await response.json()
        showNotification(error.error || "Failed to submit review", "error")
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      showNotification("Failed to submit review", "error")
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 hover:opacity-70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Reviews & Ratings</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleSyncExternal}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync External Reviews"}
              </Button>
              <Button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "Write a Review"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-gray-600">
                Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </div>
            </div>

            {/* Rating Breakdown */}
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingCounts[rating] || 0
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <div className="flex items-center gap-1 w-20">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Rating *</label>
                <Select
                  value={formData.rating}
                  onValueChange={(value) => setFormData({ ...formData, rating: value || "" })}
                >
                  <SelectTrigger>
                    <SelectValue>{formData.rating || "Select rating"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <SelectItem key={rating} value={rating.toString()}>
                        {rating} {rating === 1 ? "Star" : "Stars"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Review Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title for your review"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Review *</label>
                <Textarea
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Share your experience..."
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Name</label>
                  <Input
                    value={formData.reviewerName}
                    onChange={(e) => setFormData({ ...formData, reviewerName: e.target.value })}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={formData.reviewerEmail}
                    onChange={(e) => setFormData({ ...formData, reviewerEmail: e.target.value })}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category (Optional)</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value || "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {reviewCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Course</label>
                  <Input
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    placeholder="e.g., MBA, B.Tech"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Batch</label>
                  <Input
                    value={formData.batch}
                    onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                    placeholder="e.g., 2023"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">
                  Submit Review
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 && !showForm && (
        <Card>
          <CardContent className="py-8 text-center text-gray-600">
            No reviews yet. Be the first to review this college!
          </CardContent>
        </Card>
      )}

      {reviews.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">All Reviews</h3>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {renderStars(review.rating)}
                      {review.title && (
                        <span className="font-semibold text-lg">{review.title}</span>
                      )}
                      {review.category && (
                        <Badge variant="outline" className="capitalize">
                          {review.category.replace("_", " ")}
                        </Badge>
                      )}
                      {review.isVerified && (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified Student
                        </Badge>
                      )}
                      {getSourceBadge(review.source)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                      {review.reviewerName && (
                        <span className="font-medium">{review.reviewerName}</span>
                      )}
                      {review.course && <span>{review.course}</span>}
                      {review.batch && <span>Batch {review.batch}</span>}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {review.externalDate
                          ? new Date(review.externalDate).toLocaleDateString()
                          : new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {review.externalUrl && (
                        <a
                          href={review.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Original
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{review.review}</p>
                
                {/* Photos */}
                {review.photos && review.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Photos</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {review.photos.map((photo, idx) => (
                        <div key={idx} className="relative h-32 rounded-lg overflow-hidden border">
                          <Image
                            src={photo}
                            alt={`Review photo ${idx + 1}`}
                            fill
                            className="object-cover cursor-pointer hover:opacity-80"
                            onClick={() => window.open(photo, "_blank")}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {review.videoUrl && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Video className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-600">Video Review</span>
                    </div>
                    <div className="rounded-lg overflow-hidden border">
                      <iframe
                        src={review.videoUrl}
                        className="w-full h-64"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* College Reply */}
                {review.replyFromCollege && (
                  <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">College Response</span>
                      {review.replyDate && (
                        <span className="text-xs text-blue-700">
                          {new Date(review.replyDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-900">{review.replyFromCollege}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/reviews/${review.id}/helpful`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ helpful: true }),
                        })
                        if (response.ok) {
                          fetchReviews()
                        }
                      } catch (error) {
                        console.error("Error voting:", error)
                      }
                    }}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Helpful ({review.helpfulCount || 0})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/reviews/${review.id}/helpful`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ helpful: false }),
                        })
                        if (response.ok) {
                          fetchReviews()
                        }
                      } catch (error) {
                        console.error("Error voting:", error)
                      }
                    }}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    Not Helpful ({review.notHelpfulCount || 0})
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

