# Business Application - Next Steps Summary

## ✅ What We've Accomplished Today

1. **Refactored Business Application Architecture**
   - Created `BusinessApplicationContext` for centralized state management
   - Follows the same clean architecture pattern as customer portal
   - Full TypeScript support with proper types

2. **Added Form Validation**
   - Field-level validation with error displays
   - Step-level validation before navigation
   - Real-time error clearing on field update

3. **Updated UI/UX**
   - Navbar matches landing page design
   - Added cursor-pointer to all buttons
   - Improved visual consistency

4. **Prepared Locations Feature**
   - Added `BusinessLocation` interface to context
   - Added location management methods (`addLocation`, `updateLocation`, `removeLocation`)
   - Context is ready for Step 5 implementation

5. **Created Comprehensive Documentation**
   - `TODO-BUSINESS-APPLICATION.md` - Full list of missing features and improvements
   - Prioritized into 3 phases (Critical, Important, Enhancement)

---

## 📋 Detailed TODO Summary

### Priority 1 - Critical (MVP Requirements)

#### 1. Business Locations Step (Step 5)
**What's needed**: Add a new step between "Business Registration" and "Operating Hours"

**User Flow**:
- Radio choice: "Single Location (HQ)" or "Multiple Locations"
- If single: Use address from Step 3, mark as headquarters
- If multiple: Show form to add locations with fields:
  - Location name
  - Full address
  - Phone/email
  - Mark as primary (HQ)

**Implementation Status**:
- ✅ Context updated with locations support
- ✅ Location management methods added
- ⏳ UI needs to be built in `apply/page.tsx`
- ⏳ Step numbers need updating (current steps 5-7 become 6-8)

**Where to add**:
```typescript
// In src/app/business/apply/page.tsx
const steps = [
  { id: 1, title: 'Basic Information', ... },
  { id: 2, title: 'Owner Details', ... },
  { id: 3, title: 'Location & Address', ... },
  { id: 4, title: 'Business Registration', ... },
  { id: 5, title: 'Business Locations', description: 'Add your business locations' }, // NEW
  { id: 6, title: 'Operations', ... }, // Was 5
  { id: 7, title: 'Documents', ... }, // Was 6
  { id: 8, title: 'Review & Submit', ... } // Was 7
]

// Then create:
const renderStep5 = () => (
  // Location selection and management UI
)
```

#### 2. Document Upload (Step 6, was Step 5)
**What's needed**: Actual file upload functionality

Currently it's just UI mockup. Need to:
- Handle file selection
- Validate file type and size
- Upload to Supabase Storage
- Store URLs in form data

**Files to create**:
- `/src/lib/utils/file-upload.ts` - Upload helpers
- `/src/app/api/upload/documents/route.ts` - Upload endpoint

#### 3. Email Verification
**What's needed**: Send verification email after application

- Create verification email template
- Generate secure token
- Send email via API
- Create `/app/verify-email/[token]/page.tsx`

#### 4. Business Account Creation (Backend)
**What's needed**: When super admin approves application

On approval, create:
- `businesses` table entry
- `business_locations` table entries (including HQ)
- User auth account
- Link user to business
- Send welcome email

This is the most complex part as it ties everything together.

---

### Priority 2 - Important (Launch Requirements)

#### 5. Super Admin Review Interface
Create UI for super admins to:
- View pending applications
- See all submitted info and documents
- Approve/reject with notes

#### 6. Post-Submission Experience
- Success page after submission
- Application status tracking page
- Email confirmation

#### 7. Form Validation Improvements
- Postal code format (4 digits)
- Company registration format
- Bank details validation

#### 8. Terms & Conditions Pages
- Create `/app/terms/page.tsx`
- Create `/app/privacy/page.tsx`

---

### Priority 3 - Enhancements

#### 9. Progress Persistence
Save draft to localStorage so users can resume

#### 10. Dynamic Categories
Move hardcoded categories to database

---

## 🎯 Recommended Immediate Next Step

**Implement Business Locations Step (Step 5)**

This is the most important missing piece that you specifically requested. Here's a quick implementation guide:

### Quick Implementation for Step 5:

```typescript
// In src/app/business/apply/page.tsx

const renderStep5 = () => {
  const { formData, updateFormData, addLocation, removeLocation } = useBusinessApplication()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Business Locations</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radio selection */}
        <div className="space-y-4">
          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="locationType"
              value="single"
              checked={formData.locationType === 'single'}
              onChange={(e) => updateFormData('locationType', e.target.value as 'single' | 'multiple')}
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium">Single Location (Headquarters Only)</p>
              <p className="text-sm text-gray-600">Use the address from Step 3</p>
            </div>
          </label>

          <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer">
            <input
              type="radio"
              name="locationType"
              value="multiple"
              checked={formData.locationType === 'multiple'}
              onChange={(e) => updateFormData('locationType', e.target.value as 'single' | 'multiple')}
              className="w-4 h-4"
            />
            <div>
              <p className="font-medium">Multiple Locations</p>
              <p className="text-sm text-gray-600">Add multiple business locations</p>
            </div>
          </label>
        </div>

        {/* Show location form if multiple selected */}
        {formData.locationType === 'multiple' && (
          <div>
            {/* Add location form here */}
            {/* List of added locations */}
          </div>
        )}

        {/* Info message */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-900">
            {formData.locationType === 'single'
              ? 'Your headquarters address will be used. You can add more locations later from your business dashboard.'
              : 'Add all your business locations now, or add more later from your dashboard.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

Then update the `renderCurrentStep` switch to include:
```typescript
case 5: return renderStep5()
case 6: return renderStep6() // Was 5
case 7: return renderStep7() // Was 6
case 8: return renderStep8() // Was 7
```

---

## 💡 Quick Wins

If you want to tackle smaller items first:

1. **Terms Pages** (30 min) - Just create basic markdown pages
2. **Step Count Update** (5 min) - Change "Step X of 7" to "Step X of 8"
3. **Validation Messages** (15 min) - Add remaining field validations
4. **Progress Indicator** (20 min) - Add localStorage save/restore

---

## 📁 File Reference

**Key files you'll work with**:
- Context: `/src/lib/context/business-application-context.tsx` ✅ Updated
- Application Page: `/src/app/business/apply/page.tsx` - Needs Step 5
- API Route: `/src/app/api/applications/route.ts` - Will need locations handling
- TODO: `/TODO-BUSINESS-APPLICATION.md` - Full detailed list

---

## 🤝 Ready for Your Input

The context is ready to support locations. Would you like me to:

1. **Implement Step 5 UI now** (the locations step)?
2. **Start with document upload** instead?
3. **Create the terms/privacy pages** first?
4. **Focus on something else** from the list?

Let me know what makes sense for your priorities!
