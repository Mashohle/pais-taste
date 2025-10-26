"use client"

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, Car, Scissors, Wrench, CheckCircle } from "lucide-react"

// Mock services data
const mockServices = {
  car_wash: [
    {
      id: '1',
      name: 'Basic Wash',
      description: 'Exterior wash, rinse, and dry',
      price: 80.00,
      duration: 30,
      category: 'Basic',
      popular: false
    },
    {
      id: '2',
      name: 'Premium Wash & Wax',
      description: 'Complete exterior wash, wax, tire shine, interior vacuum',
      price: 180.00,
      duration: 60,
      category: 'Premium',
      popular: true
    },
    {
      id: '3',
      name: 'Full Detail',
      description: 'Complete interior and exterior detailing, paint protection',
      price: 350.00,
      duration: 120,
      category: 'Premium',
      popular: true
    },
    {
      id: '4',
      name: 'Interior Deep Clean',
      description: 'Deep cleaning of seats, carpets, dashboard, and all surfaces',
      price: 220.00,
      duration: 90,
      category: 'Interior',
      popular: false
    }
  ],
  salon: [
    {
      id: '1',
      name: 'Haircut & Style',
      description: 'Professional cut and styling',
      price: 150.00,
      duration: 60,
      category: 'Hair',
      popular: true
    },
    {
      id: '2',
      name: 'Color Treatment',
      description: 'Full color application with conditioning treatment',
      price: 350.00,
      duration: 120,
      category: 'Hair',
      popular: true
    },
    {
      id: '3',
      name: 'Manicure',
      description: 'Complete nail care and polish application',
      price: 120.00,
      duration: 45,
      category: 'Nails',
      popular: false
    },
    {
      id: '4',
      name: 'Facial Treatment',
      description: 'Deep cleansing facial with moisturizing treatment',
      price: 280.00,
      duration: 75,
      category: 'Skincare',
      popular: false
    }
  ],
  service: [
    {
      id: '1',
      name: 'Basic Service',
      description: 'Standard maintenance and inspection',
      price: 200.00,
      duration: 90,
      category: 'Maintenance',
      popular: true
    },
    {
      id: '2',
      name: 'Premium Service',
      description: 'Complete service with premium parts and warranty',
      price: 450.00,
      duration: 180,
      category: 'Maintenance',
      popular: false
    }
  ]
}

// Mock staff data
const mockStaff = [
  {
    id: '1',
    name: 'Mike Thompson',
    specialties: ['Premium Detail', 'Paint Correction'],
    rating: 4.8,
    available_times: ['09:00', '11:00', '14:00', '16:00']
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    specialties: ['Color Treatment', 'Styling'],
    rating: 4.9,
    available_times: ['10:00', '13:00', '15:00', '17:00']
  },
  {
    id: '3',
    name: 'David Lee',
    specialties: ['Basic Wash', 'Interior Cleaning'],
    rating: 4.6,
    available_times: ['08:00', '10:00', '12:00', '15:00']
  }
]

interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  popular: boolean
}

interface Business {
  id: string
  name: string
  category: 'car_wash' | 'salon' | 'service'
  phone?: string
  opening_hours: Record<string, { open: string; close: string; closed?: boolean }>
}

interface ServiceBookingProps {
  business: Business
}

export default function ServiceBookingInterface({ business }: ServiceBookingProps) {
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedStaff, setSelectedStaff] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    // Car wash specific
    vehicleDetails: '',
    // Salon specific
    preferredStyle: ''
  })
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const services = mockServices[business.category as keyof typeof mockServices] || []

  // Get available time slots for selected date
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedService) return []

    // Mock available slots - in real app, this would check actual availability
    const allSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

    // Filter by business hours
    const dayName = selectedDate.toLocaleDateString('en', { weekday: 'long' }).toLowerCase()
    const businessHours = business.opening_hours[dayName]
    
    if (!businessHours || businessHours.closed) return []
    
    return allSlots.filter(slot => {
      return slot >= businessHours.open && slot <= businessHours.close
    })
  }, [selectedDate, selectedService, business.opening_hours])

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setShowBookingForm(true)
  }

  const handleBookingSubmit = () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone) {
      alert('Please fill in all required fields')
      return
    }

    // TODO: Integrate with actual booking system
    console.log('Booking submitted:', {
      business: business.id,
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      staff: selectedStaff,
      customer: customerInfo
    })

    setShowBookingForm(false)
    setShowConfirmation(true)
  }

  const resetBooking = () => {
    setSelectedService(null)
    setSelectedDate(undefined)
    setSelectedTime('')
    setSelectedStaff('')
    setCustomerInfo({
      name: '',
      phone: '',
      email: '',
      notes: '',
      vehicleDetails: '',
      preferredStyle: ''
    })
    setShowBookingForm(false)
    setShowConfirmation(false)
  }

  const getServiceIcon = () => {
    switch (business.category) {
      case 'car_wash': return Car
      case 'salon': return Scissors
      case 'service': return Wrench
      default: return Wrench
    }
  }

  const ServiceIcon = getServiceIcon()

  return (
    <div className="space-y-6">
      {/* Services List */}
      <div>
        <h3 className="text-xl font-semibold text-stone-800 mb-4">
          Available Services
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(service => (
            <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleServiceSelect(service)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                      <ServiceIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-800 flex items-center gap-2">
                        {service.name}
                        {service.popular && (
                          <Badge className="text-xs bg-blue-500 text-white">Popular</Badge>
                        )}
                      </h4>
                      <Badge variant="outline" className="text-xs">{service.category}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-stone-800">
                      R{service.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-stone-600 mb-3">{service.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-stone-500">
                    <Clock className="w-3 h-3" />
                    {service.duration} minutes
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {services.length === 0 && (
          <Card className="p-8 text-center">
            <ServiceIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No services available</h3>
            <p className="text-gray-600">Services for this business are being updated.</p>
          </Card>
        )}
      </div>

      {/* Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book {selectedService?.name}</DialogTitle>
            <DialogDescription>
              Complete your booking details below
            </DialogDescription>
          </DialogHeader>

          {selectedService && (
            <div className="space-y-6">
              {/* Service Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-blue-900">{selectedService.name}</h4>
                    <p className="text-sm text-blue-700">{selectedService.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-900">
                      R{selectedService.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-blue-700">
                      {selectedService.duration} minutes
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-sm font-medium">Select Date *</Label>
                  <div className="border rounded-lg p-3 mt-2">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Time & Staff Selection */}
                <div className="space-y-4">
                  {/* Time Selection */}
                  <div>
                    <Label className="text-sm font-medium">Select Time *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Staff Selection */}
                  <div>
                    <Label className="text-sm font-medium">Preferred Staff (Optional)</Label>
                    <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Any available staff" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any available staff</SelectItem>
                        {mockStaff.map(staff => (
                          <SelectItem key={staff.id} value={staff.id}>
                            <div className="flex items-center gap-2">
                              <span>{staff.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {staff.rating}★
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estimated completion time */}
                  {selectedTime && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">
                          Service will be completed by {
                            new Date(`2024-01-01T${selectedTime}`).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false
                            }).split(':').map((part, index) => {
                              if (index === 1) {
                                return String(parseInt(part) + selectedService.duration).padStart(2, '0')
                              }
                              return part
                            }).join(':')
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Customer Information */}
              <div>
                <h4 className="font-semibold text-stone-800 mb-4">Your Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-2"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email Address (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-2"
                    />
                  </div>

                  {/* Business-specific fields */}
                  {business.category === 'car_wash' && (
                    <div className="md:col-span-2">
                      <Label htmlFor="vehicle">Vehicle Details (Optional)</Label>
                      <Input
                        id="vehicle"
                        placeholder="e.g., 2018 BMW 320i - White"
                        value={customerInfo.vehicleDetails}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, vehicleDetails: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {business.category === 'salon' && (
                    <div className="md:col-span-2">
                      <Label htmlFor="style">Preferred Style/Notes (Optional)</Label>
                      <Input
                        id="style"
                        placeholder="Describe your preferred style or any specific requests"
                        value={customerInfo.preferredStyle}
                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, preferredStyle: e.target.value }))}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Special Instructions (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or notes for the service provider..."
                      value={customerInfo.notes}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              {selectedDate && selectedTime && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">
                        {selectedDate.toLocaleDateString('en-ZA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="font-medium">{selectedService.duration} minutes</span>
                    </div>
                    {selectedStaff && (
                      <div className="flex justify-between">
                        <span>Staff:</span>
                        <span className="font-medium">
                          {mockStaff.find(s => s.id === selectedStaff)?.name}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>R{selectedService.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleBookingSubmit}
              disabled={!selectedDate || !selectedTime || !customerInfo.name || !customerInfo.phone}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your booking has been successfully submitted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                You will receive a confirmation call or message shortly. 
                Please save our contact details: {business.phone}
              </p>
            </div>

            <div className="text-sm space-y-2">
              <div><strong>Booking ID:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
              <div><strong>Service:</strong> {selectedService?.name}</div>
              <div><strong>Business:</strong> {business.name}</div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={resetBooking} className="w-full">
              Book Another Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}