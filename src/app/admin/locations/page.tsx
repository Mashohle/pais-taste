"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageLoading } from '@/lib/hooks'
import {
  Search,
  Plus,
  MapPin,
  Clock,
  Phone,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Users
} from "lucide-react"

interface Location {
  id: string
  name: string
  address: string
  city: string
  province: string
  postal_code: string
  phone?: string
  description?: string
  operating_hours: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  is_active: boolean
  is_primary: boolean
  capacity?: number
  amenities: string[]
  created_at: string
}

// Mock data - in real app this would come from database
const mockLocations: Location[] = [
  {
    id: "1",
    name: "Main Branch",
    address: "123 Nelson Mandela Avenue",
    city: "Cape Town",
    province: "Western Cape",
    postal_code: "8001",
    phone: "+27 21 123 4567",
    description: "Our flagship location in the heart of Cape Town, featuring traditional South African cuisine with a modern twist.",
    operating_hours: {
      monday: "09:00 - 21:00",
      tuesday: "09:00 - 21:00",
      wednesday: "09:00 - 21:00",
      thursday: "09:00 - 21:00",
      friday: "09:00 - 22:00",
      saturday: "08:00 - 22:00",
      sunday: "08:00 - 20:00"
    },
    is_active: true,
    is_primary: true,
    capacity: 120,
    amenities: ["WiFi", "Parking", "Takeaway", "Delivery", "Outdoor Seating"],
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    name: "Stellenbosch Branch",
    address: "45 Church Street",
    city: "Stellenbosch",
    province: "Western Cape",
    postal_code: "7600",
    phone: "+27 21 987 6543",
    description: "Located in the beautiful wine country, perfect for tourists and locals alike.",
    operating_hours: {
      monday: "10:00 - 20:00",
      tuesday: "10:00 - 20:00",
      wednesday: "10:00 - 20:00",
      thursday: "10:00 - 20:00",
      friday: "10:00 - 21:00",
      saturday: "09:00 - 21:00",
      sunday: "09:00 - 19:00"
    },
    is_active: true,
    is_primary: false,
    capacity: 80,
    amenities: ["WiFi", "Parking", "Wine Bar", "Takeaway"],
    created_at: "2024-02-01T10:00:00Z"
  },
  {
    id: "3",
    name: "V&A Waterfront Kiosk",
    address: "V&A Waterfront, Shop 234",
    city: "Cape Town",
    province: "Western Cape",
    postal_code: "8002",
    description: "Small kiosk for quick service and takeaways at the popular waterfront.",
    operating_hours: {
      monday: "10:00 - 18:00",
      tuesday: "10:00 - 18:00",
      wednesday: "10:00 - 18:00",
      thursday: "10:00 - 18:00",
      friday: "10:00 - 19:00",
      saturday: "09:00 - 19:00",
      sunday: "09:00 - 18:00"
    },
    is_active: false,
    is_primary: false,
    capacity: 20,
    amenities: ["Takeaway", "Quick Service"],
    created_at: "2024-03-01T10:00:00Z"
  }
]

export default function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const coordinatedLoading = usePageLoading(loading, 'locations')
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Load locations data
  useEffect(() => {
    const loadLocations = async () => {
      setLoading(true)

      // In a real app, this would be an API call

      setLocations(mockLocations)
      setLoading(false)
    }

    loadLocations()
  }, [])

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleLocationStatus = (id: string) => {
    setLocations(locations.map(location =>
      location.id === id
        ? { ...location, is_active: !location.is_active }
        : location
    ))
  }

  const deleteLocation = (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      setLocations(locations.filter(location => location.id !== id))
    }
  }

  const activeLocations = locations.filter(l => l.is_active)

  // Show loading state with skeleton
  if (coordinatedLoading) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Search Skeleton */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 mb-6">
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-stone-200">
                <div className="text-center">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </div>
            ))}
          </div>

          {/* Location Cards Skeleton */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white border border-stone-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="flex gap-1">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Address skeleton */}
                    <div className="flex items-start space-x-2">
                      <Skeleton className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>

                    {/* Phone skeleton */}
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>

                    {/* Hours skeleton */}
                    <div className="flex items-start space-x-2">
                      <Skeleton className="w-4 h-4 mt-0.5" />
                      <Skeleton className="h-4 w-28" />
                    </div>

                    {/* Description skeleton */}
                    <div>
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Amenities skeleton */}
                    <div className="flex flex-wrap gap-1">
                      <Skeleton className="h-5 w-12" />
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>

                    {/* Actions skeleton */}
                    <div className="flex items-center justify-between pt-2">
                      <Skeleton className="h-3 w-24" />
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded" />
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-800">Location Management</h1>
            <p className="text-stone-600 mt-1">
              Manage your business locations • {locations.length} total locations
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-stone-700 hover:bg-stone-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Location</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Location Name*</Label>
                    <Input id="name" placeholder="e.g., Main Branch" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+27 21 123 4567" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address*</Label>
                  <Input id="address" placeholder="123 Main Street" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City*</Label>
                    <Input id="city" placeholder="Cape Town" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="province">Province*</Label>
                    <Input id="province" placeholder="Western Cape" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code*</Label>
                    <Input id="postal_code" placeholder="8001" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe this location..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Seating Capacity</Label>
                  <Input id="capacity" type="number" placeholder="50" />
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-stone-700 hover:bg-stone-800">
                    Add Location
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-4 h-4" />
            <Input
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-stone-300 focus:border-stone-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-stone-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-stone-800">{locations.length}</div>
              <div className="text-stone-600 text-sm">Total Locations</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{activeLocations.length}</div>
              <div className="text-green-600 text-sm">Active</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {locations.reduce((sum, l) => sum + (l.capacity || 0), 0)}
              </div>
              <div className="text-blue-600 text-sm">Total Capacity</div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-700">
                {new Set(locations.map(l => l.city)).size}
              </div>
              <div className="text-amber-600 text-sm">Cities</div>
            </div>
          </div>
        </div>

        {/* Locations Grid */}
        <div className="space-y-4">
          {filteredLocations.map((location) => (
            <Card
              key={location.id}
              className="bg-white border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-stone-800 mb-1 flex items-center gap-2">
                      {location.name}
                      {location.is_primary && (
                        <Badge className="bg-amber-100 text-amber-800 text-xs">
                          Primary
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1">
                      <Badge
                        variant={location.is_active ? "default" : "secondary"}
                        className={location.is_active ? "bg-green-100 text-green-800" : "bg-stone-100 text-stone-600"}
                      >
                        {location.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {location.capacity && (
                        <Badge variant="outline" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {location.capacity} seats
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleLocationStatus(location.id)}
                      className={`p-1 rounded-full transition-colors ${
                        location.is_active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                      }`}
                      title={location.is_active ? "Click to deactivate" : "Click to activate"}
                    >
                      {location.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-stone-600">
                      <div>{location.address}</div>
                      <div>{location.city}, {location.province} {location.postal_code}</div>
                    </div>
                  </div>

                  {/* Phone */}
                  {location.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-stone-500 flex-shrink-0" />
                      <span className="text-sm text-stone-600">{location.phone}</span>
                    </div>
                  )}

                  {/* Operating Hours */}
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-stone-600">
                      {location.operating_hours.monday ? (
                        <div>Mon-Fri: {location.operating_hours.monday}</div>
                      ) : (
                        <div>Hours not set</div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {location.description && (
                    <p className="text-sm text-stone-600 line-clamp-2">
                      {location.description}
                    </p>
                  )}

                  {/* Amenities */}
                  {location.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {location.amenities.slice(0, 3).map((amenity) => (
                        <Badge key={amenity} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {location.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{location.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-stone-500">
                      Added {new Date(location.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-stone-300 hover:bg-stone-50"
                        onClick={() => {/* TODO: Implement edit functionality */}}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {!location.is_primary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteLocation(location.id)}
                          className="border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results State */}
        {filteredLocations.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-stone-200">
              <MapPin className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <p className="text-stone-600 text-lg">No locations found matching your criteria.</p>
              <p className="text-stone-500 text-sm mt-2">Try adjusting your search or add a new location.</p>
              {locations.length === 0 && (
                <Button
                  className="mt-4 bg-stone-700 hover:bg-stone-800 text-white"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Location
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}