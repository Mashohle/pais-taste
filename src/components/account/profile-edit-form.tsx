"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Save,
  X,
  Loader2,
} from "lucide-react"

interface UserProfile {
  full_name?: string
  phone?: string
  preferred_pickup_location?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  dietary_preferences?: string[] | null
  allergies?: string[] | null
  marketing_emails?: boolean
  sms_notifications?: boolean
}

interface ProfileEditFormProps {
  profile: UserProfile | null
  onSave: (data: Partial<UserProfile>) => Promise<void>
  onCancel?: () => void
  saving: boolean
  hideCancel?: boolean
}

export default function ProfileEditForm({ profile, onSave, onCancel, saving, hideCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    preferred_pickup_location: profile?.preferred_pickup_location || '',
    address: profile?.address || '',
    emergency_contact_name: profile?.emergency_contact_name || '',
    emergency_contact_phone: profile?.emergency_contact_phone || '',
    dietary_preferences: profile?.dietary_preferences?.join(', ') || '',
    allergies: profile?.allergies?.join(', ') || '',
    marketing_emails: profile?.marketing_emails ?? true,
    sms_notifications: profile?.sms_notifications ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const updateData = {
      ...formData,
      dietary_preferences: formData.dietary_preferences 
        ? formData.dietary_preferences.split(',').map((item: string) => item.trim()).filter(Boolean)
        : null,
      allergies: formData.allergies 
        ? formData.allergies.split(',').map((item: string) => item.trim()).filter(Boolean)
        : null,
    }
    
    await onSave(updateData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="bg-white/60"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+27 81 234 5678"
            className="bg-white/60"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="preferred_pickup_location">Preferred Pickup Location *</Label>
        <Input
          id="preferred_pickup_location"
          value={formData.preferred_pickup_location}
          onChange={(e) => setFormData(prev => ({ ...prev, preferred_pickup_location: e.target.value }))}
          placeholder="e.g., Montana, Sinoville, Annlin"
          className="bg-white/60"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          placeholder="Your full address (optional)"
          className="bg-white/60"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
          <Input
            id="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
            placeholder="Emergency contact person"
            className="bg-white/60"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
          <Input
            id="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
            placeholder="+27 81 234 5678"
            className="bg-white/60"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dietary_preferences">Dietary Preferences</Label>
          <Input
            id="dietary_preferences"
            value={formData.dietary_preferences}
            onChange={(e) => setFormData(prev => ({ ...prev, dietary_preferences: e.target.value }))}
            placeholder="e.g., Vegetarian, Halal, Low-carb"
            className="bg-white/60"
          />
          <p className="text-xs text-stone-500">Separate multiple preferences with commas</p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Input
            id="allergies"
            value={formData.allergies}
            onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
            placeholder="e.g., Nuts, Dairy, Gluten"
            className="bg-white/60"
          />
          <p className="text-xs text-stone-500">Separate multiple allergies with commas</p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-stone-800">Communication Preferences</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.marketing_emails}
              onChange={(e) => setFormData(prev => ({ ...prev, marketing_emails: e.target.checked }))}
              className="rounded border-stone-300"
            />
            <span className="text-sm">Receive marketing emails and promotions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.sms_notifications}
              onChange={(e) => setFormData(prev => ({ ...prev, sms_notifications: e.target.checked }))}
              className="rounded border-stone-300"
            />
            <span className="text-sm">Receive SMS notifications about orders</span>
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={saving} className="bg-stone-700 hover:bg-stone-800 flex-1 md:flex-none">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
        {!hideCancel && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 md:flex-none">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}