"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  Filter, 
  Search, 
  ThumbsUp,
  Edit,
  Trash2,
  MapPin,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

// Mock reviews data representing past reviews across all business types
const mockReviews = [
  {
    id: "review_1",
    business_id: "bus_1",
    business_name: "Mama Africa Kitchen",
    business_category: "food",
    order_id: "order_1", 
    order_type: "order",
    rating: 5,
    title: "Authentic South African flavors!",
    comment: "The bobotie was absolutely incredible - perfectly spiced and with the most amazing texture. The malva pudding was the perfect ending to an outstanding meal. Definitely ordering again!",
    date: "2024-08-16T10:30:00Z",
    verified: true,
    helpful_votes: 12,
    business_response: {
      response: "Thank you so much for your wonderful review! We're thrilled you enjoyed our authentic bobotie and malva pudding. Can't wait to serve you again!",
      date: "2024-08-16T14:20:00Z",
      responder: "Chef Nomsa"
    },
    photos: ["/api/placeholder/300/200"]
  },
  {
    id: "review_2", 
    business_id: "bus_5",
    business_name: "Shine & Wash Car Care",
    business_category: "services",
    order_id: "booking_1",
    order_type: "booking",
    rating: 4,
    title: "Great service, attention to detail",
    comment: "Mike did an excellent job with my car wash. Very thorough and professional. The interior detailing was particularly impressive. Only minor issue was that I had to wait a bit longer than expected.",
    date: "2024-08-10T16:45:00Z",
    verified: true,
    helpful_votes: 8,
    business_response: {
      response: "Thank you for the feedback! We're glad you were happy with Mike's work. We're working on improving our scheduling to reduce wait times. Your satisfaction is our priority!",
      date: "2024-08-11T09:15:00Z",
      responder: "Manager John"
    }
  },
  {
    id: "review_3",
    business_id: "bus_6", 
    business_name: "African Craft Co",
    business_category: "retail",
    order_id: "order_2",
    order_type: "order",
    rating: 5,
    title: "Beautiful authentic crafts",
    comment: "The Ndebele basket is absolutely stunning - the craftsmanship is incredible. The wooden giraffe is perfect for my collection. Everything arrived well-packaged and exactly as described. Supporting local artisans feels great!",
    date: "2024-08-08T19:20:00Z",
    verified: true,
    helpful_votes: 15,
    business_response: {
      response: "We're so happy you love your new pieces! Supporting our local artisans means the world to us. Thank you for being part of preserving our cultural heritage.",
      date: "2024-08-09T08:30:00Z",
      responder: "Curator Thabo"
    },
    photos: ["/api/placeholder/300/200", "/api/placeholder/300/200"]
  },
  {
    id: "review_4",
    business_id: "bus_7",
    business_name: "Serenity Spa & Wellness",
    business_category: "services", 
    order_id: "booking_2",
    order_type: "booking",
    rating: 5,
    title: "Ultimate relaxation experience",
    comment: "Sarah's hot stone massage was absolutely divine. The traditional African techniques were so unique and deeply relaxing. The spa atmosphere was perfect - peaceful and authentic. Already booked my next appointment!",
    date: "2024-07-25T18:45:00Z",
    verified: true,
    helpful_votes: 20,
    business_response: {
      response: "Thank you for sharing your beautiful experience! Sarah will be so pleased to hear this. We look forward to welcoming you back for your next wellness journey.",
      date: "2024-07-26T07:45:00Z",
      responder: "Spa Manager Lindiwe"
    }
  },
  {
    id: "review_5",
    business_id: "bus_1",
    business_name: "Mama Africa Kitchen", 
    business_category: "food",
    order_id: "order_3",
    order_type: "order",
    rating: 4,
    title: "Hearty traditional meal",
    comment: "The potjiekos was wonderfully hearty and flavorful. The mealie bread was fresh and perfect for sopping up the stew. Generous portions and great value. Would love to see more vegetarian options in the future.",
    date: "2024-07-21T12:15:00Z",
    verified: true,
    helpful_votes: 6
  }
]

export default function ReviewsTab() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("all")
  const [selectedBusiness, setSelectedBusiness] = useState<string>("all")
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all")
  const [showOnlyWithPhotos, setShowOnlyWithPhotos] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)

  // Get unique businesses for filter dropdown
  const uniqueBusinesses = useMemo(() => {
    const businesses = mockReviews.map(review => ({
      id: review.business_id,
      name: review.business_name,
      category: review.business_category
    }))
    return Array.from(new Map(businesses.map(b => [b.id, b])).values())
  }, [])

  // Filter reviews
  const filteredReviews = useMemo(() => {
    return mockReviews.filter(review => {
      // Search filter
      if (searchTerm && !review.business_name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !review.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !review.comment.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Business type filter
      if (selectedBusinessType !== "all" && review.business_category !== selectedBusinessType) {
        return false
      }

      // Specific business filter
      if (selectedBusiness !== "all" && review.business_id !== selectedBusiness) {
        return false
      }

      // Rating filter
      if (selectedRating !== "all") {
        const ratingThreshold = parseInt(selectedRating)
        if (review.rating < ratingThreshold) {
          return false
        }
      }

      // Time range filter
      if (selectedTimeRange !== "all") {
        const reviewDate = new Date(review.date)
        const now = new Date()
        const diffInDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24))
        
        switch (selectedTimeRange) {
          case "week":
            if (diffInDays > 7) return false
            break
          case "month":
            if (diffInDays > 30) return false
            break
          case "3months":
            if (diffInDays > 90) return false
            break
          case "year":
            if (diffInDays > 365) return false
            break
        }
      }

      // Photos filter
      if (showOnlyWithPhotos && (!review.photos || review.photos.length === 0)) {
        return false
      }

      return true
    })
  }, [searchTerm, selectedBusinessType, selectedBusiness, selectedRating, selectedTimeRange, showOnlyWithPhotos])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4", 
      lg: "w-5 h-5"
    }
    
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-stone-300"
            }`}
          />
        ))}
      </div>
    )
  }

  const handleEditReview = (reviewId: string) => {
    setEditingReview(reviewId)
    // In real app, would open edit dialog with current review data
  }

  const handleDeleteReview = (reviewId: string) => {
    if (confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      // In real app, would call API to delete review
      console.log("Deleting review:", reviewId)
    }
  }

  const handleWriteReview = () => {
    // Navigate to orders to select an order to review
    router.push("/account/orders?review=true")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-stone-600" />
          <h2 className="text-xl font-semibold text-stone-800">
            My Reviews ({filteredReviews.length})
          </h2>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-stone-700 border-stone-300">
            {mockReviews.length} Total
          </Badge>
          <Button onClick={handleWriteReview} className="bg-stone-700 hover:bg-stone-800">
            Write Review
          </Button>
        </div>
      </div>

      {mockReviews.length > 0 ? (
        <>
          {/* Filters */}
          <Card className="p-6 bg-white/50 backdrop-blur-sm border-stone-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-stone-300 focus:border-stone-500"
                />
              </div>

              {/* Business Type */}
              <Select value={selectedBusinessType} onValueChange={setSelectedBusinessType}>
                <SelectTrigger className="border-stone-300">
                  <Filter className="w-4 h-4 mr-2 text-stone-400" />
                  <SelectValue placeholder="Business Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="food">Restaurants</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>

              {/* Specific Business */}
              <Select value={selectedBusiness} onValueChange={setSelectedBusiness}>
                <SelectTrigger className="border-stone-300">
                  <MapPin className="w-4 h-4 mr-2 text-stone-400" />
                  <SelectValue placeholder="Business" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Businesses</SelectItem>
                  {uniqueBusinesses.map((business) => (
                    <SelectItem key={business.id} value={business.id}>
                      {business.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Rating Filter */}
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="border-stone-300">
                  <Star className="w-4 h-4 mr-2 text-stone-400" />
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="2">2+ Stars</SelectItem>
                  <SelectItem value="1">1+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Additional Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Time Range */}
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="border-stone-300">
                  <Calendar className="w-4 h-4 mr-2 text-stone-400" />
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>

              {/* Photos Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="photos-filter"
                  checked={showOnlyWithPhotos}
                  onChange={(e) => setShowOnlyWithPhotos(e.target.checked)}
                  className="rounded border-stone-300"
                />
                <label htmlFor="photos-filter" className="text-sm text-stone-700">
                  Only reviews with photos
                </label>
              </div>
            </div>
          </Card>

          {filteredReviews.length > 0 ? (
            <>
              {/* Reviews List */}
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="bg-white/80 backdrop-blur-sm border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-stone-900">{review.business_name}</h3>
                            <Badge variant="outline" className="capitalize text-xs">
                              {review.business_category}
                            </Badge>
                            {review.verified && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle className="w-3 h-3" />
                                <span className="text-xs">Verified</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(review.rating, "md")}
                            <span className="text-sm text-stone-600">{formatDate(review.date)}</span>
                          </div>
                          <h4 className="font-medium text-stone-800 mb-2">{review.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review.id)}
                            className="text-stone-600 hover:text-stone-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-stone-700 mb-4 leading-relaxed">{review.comment}</p>
                      
                      {/* Photos */}
                      {review.photos && review.photos.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg border border-stone-200"
                            />
                          ))}
                        </div>
                      )}

                      {/* Business Response */}
                      {review.business_response && (
                        <div className="bg-stone-50 rounded-lg p-4 border-l-4 border-stone-300">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-stone-800">Response from {review.business_response.responder}</span>
                            <span className="text-xs text-stone-600">{formatDate(review.business_response.date)}</span>
                          </div>
                          <p className="text-sm text-stone-700">{review.business_response.response}</p>
                        </div>
                      )}

                      {/* Review Stats */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-stone-600">
                            <ThumbsUp className="w-4 h-4" />
                            <span>{review.helpful_votes} found helpful</span>
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {review.order_type === 'order' ? 'Order' : 'Booking'} #{review.order_id.split('_')[1]}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/business/${review.business_id}`)}
                          className="text-stone-700 border-stone-300 hover:bg-stone-100"
                        >
                          Visit Business
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Review Statistics */}
              <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-lg">
                <CardContent className="py-6">
                  <h3 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Your Review Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-stone-800">{mockReviews.length}</p>
                      <p className="text-sm text-stone-600">Total Reviews</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">
                        {(mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length).toFixed(1)}
                      </p>
                      <p className="text-sm text-stone-600">Average Rating</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">
                        {mockReviews.reduce((sum, review) => sum + review.helpful_votes, 0)}
                      </p>
                      <p className="text-sm text-stone-600">Total Helpful Votes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-stone-800">
                        {mockReviews.filter(review => review.business_response).length}
                      </p>
                      <p className="text-sm text-stone-600">Businesses Responded</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* No Results */
            <Card className="bg-stone-50/50 backdrop-blur-sm border-stone-200">
              <CardContent className="text-center py-12">
                <Filter className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-stone-800 mb-2">
                  No Reviews Found
                </h3>
                <p className="text-stone-600 mb-4">
                  No reviews match your current filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedBusinessType("all")
                    setSelectedBusiness("all")
                    setSelectedRating("all")
                    setSelectedTimeRange("all")
                    setShowOnlyWithPhotos(false)
                  }}
                  className="border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Empty State */
        <Card className="bg-gradient-to-r from-stone-100/95 via-stone-50/60 to-stone-25/20 backdrop-blur-md border-stone-200/50 shadow-2xl">
          <CardContent className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-stone-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-stone-800 mb-2">
              No Reviews Yet
            </h3>
            <p className="text-stone-600 mb-6">
              Start sharing your experiences! Write reviews for businesses you've used to help others discover great local services.
            </p>
            <Button 
              onClick={handleWriteReview}
              className="bg-stone-700 hover:bg-stone-800 text-white"
            >
              Write Your First Review
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}