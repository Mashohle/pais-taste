# Business Application Flow - TODO & Improvements

## Current Status
The business application flow has been refactored with:
- ✅ Clean architecture using BusinessApplicationContext
- ✅ Form validation with error displays
- ✅ Multi-step wizard interface
- ✅ Responsive design matching landing page

## Incomplete Features & Improvements Needed

### 1. Document Upload (Step 6)
**Status**: UI only, no actual upload functionality

**Required**:
- [ ] Implement file upload functionality
  - [ ] Add file input handling
  - [ ] File size validation (max 5MB per file)
  - [ ] File type validation (PDF, JPG, PNG only)
  - [ ] Upload to cloud storage (Supabase Storage or similar)
  - [ ] Store file URLs in database
- [ ] Documents needed:
  - [ ] South African ID Document (required)
  - [ ] Business Registration Certificate (optional)
  - [ ] Bank Statement (required)
- [ ] Show upload progress indicator
- [ ] Allow file preview before submission
- [ ] Allow file removal/replacement

**Files to create/update**:
- Create: `/src/lib/utils/file-upload.ts` - Upload utility functions
- Update: `/src/app/business/apply/page.tsx` - Step 6 implementation
- Update: `/src/lib/context/business-application-context.tsx` - Add document state
- Create: `/src/app/api/upload/documents/route.ts` - Upload API endpoint

---

### 2. Business Locations (New Step)
**Status**: Not implemented

**Required**:
- [ ] Add new Step between Registration and Operations
  - Step 4 remains: Business Registration
  - **NEW Step 5**: Business Locations
  - Step 6: Operations (Operating Hours)
  - Step 7: Documents
  - Step 8: Review & Submit
- [ ] Location configuration options:
  - [ ] Radio option: "Single Location (Headquarters)"
  - [ ] Radio option: "Multiple Locations"
- [ ] If "Single Location":
  - [ ] Use address from Step 3 (Location & Address) as HQ
  - [ ] Show confirmation message
  - [ ] Allow adding more locations later
- [ ] If "Multiple Locations":
  - [ ] Show "Add Location" button
  - [ ] Location form fields:
    - Location name (e.g., "Main Branch", "Downtown Office")
    - Full address (can copy from HQ)
    - Phone number
    - Email (optional)
    - Mark as primary/headquarters (checkbox)
  - [ ] List of added locations with edit/remove options
  - [ ] Minimum 1 location required
- [ ] Store locations in `business_locations` table
- [ ] Ensure HQ is marked with `is_primary: true`

**Implementation Notes**:
```typescript
// Location data structure
interface BusinessLocation {
  name: string
  address_line1: string
  address_line2?: string
  city: string
  state: string // Province in SA
  postal_code: string
  phone?: string
  email?: string
  is_primary: boolean
}
```

**Files to update**:
- Update: `/src/lib/context/business-application-context.tsx` - Add locations array
- Update: `/src/app/business/apply/page.tsx` - Add Step 5
- Update: `/src/app/api/applications/route.ts` - Create business_locations entries

---

### 3. Email Verification
**Status**: Not implemented

**Required**:
- [ ] After application submission:
  - [ ] Send verification email to owner_email
  - [ ] Include verification link with token
  - [ ] Token expires in 24 hours
- [ ] Create email verification page
  - [ ] `/app/verify-email/[token]/page.tsx`
  - [ ] Verify token and activate account
  - [ ] Show success/error messages
- [ ] Update application status to `email_verified` after verification
- [ ] Prevent login until email is verified

**Email Templates Needed**:
- Application received confirmation
- Email verification request
- Application approved notification
- Application rejected notification

**Files to create**:
- Create: `/src/lib/utils/email.ts` - Email sending utility
- Create: `/src/app/verify-email/[token]/page.tsx` - Verification page
- Create: `/src/app/api/auth/verify-email/route.ts` - Verification API
- Update: `/src/app/api/applications/route.ts` - Send emails on submission

---

### 4. Application Review & Approval Flow
**Status**: Partially implemented (stores status, no review UI)

**Required**:
- [ ] Super Admin review interface
  - [ ] List all pending applications
  - [ ] View application details
  - [ ] View uploaded documents
  - [ ] Approve/Reject with notes
  - [ ] Request additional information
- [ ] On approval:
  - [ ] Create business entry in `businesses` table
  - [ ] Create business_locations entries
  - [ ] Create owner user account (if using password)
  - [ ] Assign business_admin role
  - [ ] Send approval email with login instructions
  - [ ] Set application status to `approved`
- [ ] On rejection:
  - [ ] Send rejection email with reason
  - [ ] Set application status to `rejected`
  - [ ] Allow resubmission after corrections

**Files to create/update**:
- Create: `/src/app/super-admin/applications/page.tsx` - Applications list
- Create: `/src/app/super-admin/applications/[id]/page.tsx` - Review details
- Create: `/src/app/api/super-admin/applications/[id]/approve/route.ts`
- Create: `/src/app/api/super-admin/applications/[id]/reject/route.ts`

---

### 5. Business Account Creation After Approval
**Status**: Not implemented

**Required**:
- [ ] On application approval:
  - [ ] Create `businesses` table entry with all info
  - [ ] Create `business_locations` table entries (HQ + additional)
  - [ ] Create user account in auth system
  - [ ] Link user to business with `business_admin` role
  - [ ] Create initial business settings/preferences
  - [ ] Set up default payment/banking info
  - [ ] Initialize empty menu/inventory
- [ ] Send welcome email with:
  - [ ] Login credentials
  - [ ] Getting started guide
  - [ ] Next steps (complete profile, add menu, etc.)

**Transaction Flow**:
```typescript
// All these must succeed or rollback
1. Create businesses entry
2. Create business_locations entries (mark HQ as is_primary)
3. Create auth user account
4. Link user to business (business_users table)
5. Create initial settings
6. Update application status to 'approved'
7. Send welcome email
```

---

### 6. Form Validation Improvements
**Status**: Basic validation implemented

**Required**:
- [ ] Step 3 (Location & Address):
  - [ ] Validate South African postal codes (4 digits)
  - [ ] Validate province selection
- [ ] Step 4 (Business Registration):
  - [ ] Validate company registration format (YYYY/XXXXXX/XX)
  - [ ] Validate tax number format
  - [ ] Validate bank account number (varies by bank)
  - [ ] Validate branch code (6 digits)
- [ ] Step 5 (Operating Hours):
  - [ ] Validate time format
  - [ ] Ensure open time is before close time
  - [ ] Warning if business is closed all days
- [ ] Cross-field validation:
  - [ ] Prevent duplicate location names
  - [ ] Ensure at least one location is marked as primary

---

### 7. Progress Persistence
**Status**: Not implemented

**Required**:
- [ ] Save form progress to localStorage
- [ ] Auto-save on field blur or step change
- [ ] Restore progress on page reload
- [ ] Clear saved progress after successful submission
- [ ] Show "Resume Application" option if draft exists
- [ ] Optional: Save draft to database for logged-in users

**Implementation**:
```typescript
// Save to localStorage
const saveProgress = () => {
  localStorage.setItem('businessApplicationDraft', JSON.stringify({
    formData,
    currentStep,
    timestamp: Date.now()
  }))
}

// Restore on mount
useEffect(() => {
  const draft = localStorage.getItem('businessApplicationDraft')
  if (draft) {
    const { formData, currentStep, timestamp } = JSON.parse(draft)
    // Check if draft is less than 7 days old
    if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
      // Show restore prompt
    }
  }
}, [])
```

---

### 8. Post-Submission Experience
**Status**: Redirects to home page with application_id

**Required**:
- [ ] Create dedicated post-submission page
  - [ ] `/app/business/apply/success/page.tsx`
  - [ ] Show submission confirmation
  - [ ] Display application ID
  - [ ] Show next steps:
    - Check email for verification link
    - Wait for admin review (3-5 business days)
    - What to prepare while waiting
  - [ ] Link to check application status
- [ ] Application status tracking page
  - [ ] `/app/business/apply/status/[id]/page.tsx`
  - [ ] Show current status (pending, under review, approved, rejected)
  - [ ] Show timeline of status changes
  - [ ] Allow viewing submitted application details

---

### 9. Business Categories & Types
**Status**: Hardcoded in component

**Required**:
- [ ] Move to database (`business_categories` table)
- [ ] Fetch categories from API
- [ ] Allow super admin to manage categories
- [ ] Support custom business types per category
- [ ] Add category descriptions and icons

---

### 10. Terms & Conditions
**Status**: Links to non-existent pages

**Required**:
- [ ] Create Terms of Service page (`/app/terms/page.tsx`)
- [ ] Create Privacy Policy page (`/app/privacy/page.tsx`)
- [ ] Create commission agreement document
- [ ] Add version tracking for terms acceptance
- [ ] Store which version user agreed to in database

---

## Priority Order for Implementation

### Phase 1 (Critical - Needed for MVP):
1. Business Locations (Step 5) - Required for proper business setup
2. Document Upload (Step 6) - Needed for verification
3. Email Verification - Security requirement
4. Business Account Creation - Complete the registration flow

### Phase 2 (Important - Needed for launch):
5. Application Review Interface (Super Admin)
6. Post-Submission Experience
7. Form Validation Improvements
8. Terms & Conditions pages

### Phase 3 (Enhancement - Nice to have):
9. Progress Persistence
10. Business Categories from Database

---

## Database Schema Requirements

### business_locations table
Ensure the following columns exist:
```sql
- id (uuid, PK)
- business_id (uuid, FK to businesses)
- name (text) - e.g., "Main Branch", "Headquarters"
- address_line1 (text)
- address_line2 (text, nullable)
- city (text)
- state (text) - Province in SA
- postal_code (text)
- country (text) - Default 'South Africa'
- phone (text, nullable)
- email (text, nullable)
- is_primary (boolean) - Marks headquarters
- is_active (boolean)
- settings (jsonb) - Opening hours, amenities, etc.
- created_at (timestamp)
- updated_at (timestamp)
```

### business_applications table
Ensure support for:
```sql
- documents (jsonb) - Array of document URLs
- locations (jsonb) - Array of location objects (optional, for preview)
```

---

## Testing Checklist

Before marking any feature as complete:
- [ ] Form validation works correctly
- [ ] Error messages are clear and helpful
- [ ] Success states are shown
- [ ] Mobile responsive
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Loading states during API calls
- [ ] Error handling for failed API requests
- [ ] Data persistence (if applicable)
- [ ] Email notifications sent (if applicable)
- [ ] Database transactions are atomic
- [ ] Security: No sensitive data in client-side logs
- [ ] Performance: No unnecessary re-renders

---

## Notes
- All email sending should be async/queued (use a job queue)
- File uploads should be validated on both client and server
- Application review should have audit trail (who approved/rejected, when, why)
- Consider rate limiting for application submissions (prevent spam)
- Add honeypot field to prevent bot submissions
