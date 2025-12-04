"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocations } from '@/lib/hooks'
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

export default function LocationsManagement() {
  const { locations, loading, error, toggleLocationStatus, deleteLocation: removeLocation } = useLocations()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleLocationStatus(id)
    } catch (err) {
      console.error('Failed to toggle location status:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      try {
        await removeLocation(id)
      } catch (err) {
        console.error('Failed to delete location:', err)
        alert('Failed to delete location. Please try again.')
      }
    }
  }

  const activeLocations = locations.filter(l => l.is_active)

  // Show loading state with skeleton
  if (loading) {
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
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="bg-white border border-stone-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-red-200">
              <p className="text-red-600 text-lg mb-4">Error loading locations</p>
              <p className="text-stone-600 text-sm">{error}</p>
            </div>
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
          <Button className="bg-stone-700 hover:bg-stone-800 text-white" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add New Location
          </Button>
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
                          Headquarters
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
                      onClick={() => handleToggleStatus(location.id)}
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
                      {location.operating_hours?.monday ? (
                        <div>
                          Mon-Fri: {location.operating_hours.monday.closed ? 'Closed' : `${location.operating_hours.monday.open} - ${location.operating_hours.monday.close}`}
                        </div>
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
                  {location.amenities && location.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {location.amenities.slice(0, 3).map((amenity, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
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
                        disabled
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {!location.is_primary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(location.id)}
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
              <p className="text-stone-600 text-lg">No locations found.</p>
              <p className="text-stone-500 text-sm mt-2">
                {locations.length === 0
                  ? "This business doesn't have any locations set up yet."
                  : "Try adjusting your search."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
