# Business Application Mobile Refactor Plan

## Overview
This document outlines the plan to refactor the business application flow (`/business/apply`) to follow the established mobile design pattern used throughout the application.

**Last Updated**: 2025-12-08
**Status**: Planning Phase

---

## Current State Analysis

### Current Implementation
**File**: `/src/app/business/apply/page.tsx`

**Current Approach**:
- Single-page multi-step form (8 steps)
- Desktop-first design with `max-w-4xl` container
- Horizontal step indicator showing all 8 steps
- Full navigation header with logo and step counter
- Card-based form sections
- Previous/Next navigation buttons

**Steps**:
1. Basic Information - Business details and category
2. Owner Details - Personal information
3. Location & Address - Business address
4. Business Registration - Legal and financial details
5. Business Locations - Multiple location management
6. Operations - Operating hours
7. Documents - Document upload (placeholder)
8. Review & Submit - Final submission

**Current Issues for Mobile**:
- Horizontal step indicator doesn't scale well on mobile
- Cards take up too much vertical space
- Navigation buttons are at the bottom of long forms
- No mobile-optimized header pattern
- Step titles and descriptions consume valuable screen space

---

## Proposed Mobile Design Pattern

### Design Approach
Transform the 8-step form into a mobile-first flow following the established pattern:

**Header + Content Overlap Pattern**:
- White header with step counter and progress
- Rounded-top content area with form fields
- Each step is a separate "page" feel
- Compact layout maximizing form visibility

---

## Component Architecture

### New Components to Create

#### 1. `MobileApplicationHeader`
**Location**: `/src/components/business/mobile-application-header.tsx`

**Features**:
- Back button (navigates to previous step or home on step 1)
- Step counter badge (e.g., "Step 2 of 8")
- Progress bar showing completion percentage
- White background with `pb-20` for overlap
- Compact and clean design

**Props**:
```tsx
interface MobileApplicationHeaderProps {
  currentStep: number
  totalSteps: number
  onBack: () => void
  canGoBack: boolean
}
```

#### 2. `MobileApplicationContent`
**Location**: `/src/components/business/mobile-application-content.tsx`

**Features**:
- Rounded-top content area (`rounded-t-[2.5rem] -mt-20`)
- Stone-50 background
- Inset shadow for depth
- Contains the current step's form
- Bottom padding for navigation buttons

**Props**:
```tsx
interface MobileApplicationContentProps {
  currentStep: number
  children: React.ReactNode
}
```

#### 3. Step-Specific Form Components
Create individual mobile-optimized form components:

**Location**: `/src/components/business/application-steps/`

**Components**:
- `mobile-step1-basic-info.tsx` - Business name, category, type
- `mobile-step2-owner-details.tsx` - Owner information and password
- `mobile-step3-location.tsx` - Address fields
- `mobile-step4-registration.tsx` - Registration and banking
- `mobile-step5-locations.tsx` - Multiple locations management
- `mobile-step6-operations.tsx` - Operating hours
- `mobile-step7-documents.tsx` - Document upload placeholder
- `mobile-step8-review.tsx` - Review and submit

#### 4. `MobileApplicationNavigation`
**Location**: `/src/components/business/mobile-application-navigation.tsx`

**Features**:
- Sticky bottom navigation bar
- Previous and Next buttons (or Submit on final step)
- Loading states
- Error indicators
- Fixed to bottom with safe area padding

**Props**:
```tsx
interface MobileApplicationNavigationProps {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  isSubmitting: boolean
  canProceed: boolean
}
```

---

## Mobile-Specific Form Optimizations

### Form Field Changes

#### 1. Input Fields
- Full-width inputs on mobile
- Larger touch targets (min 44px height)
- Better spacing between fields
- Auto-focus on first field per step

#### 2. Select Dropdowns
- Native mobile select for better UX
- Or custom bottom sheet selectors
- Category/type selection with icons

#### 3. Multi-Location Manager (Step 5)
- Simplified add/edit flow
- Bottom sheet for adding locations
- List view of added locations
- Swipe-to-delete gesture support

#### 4. Operating Hours (Step 6)
- Compact time pickers
- Toggle switches for closed days
- Collapsible day sections

#### 5. Review & Submit (Step 8)
- Collapsible sections for each step's data
- Edit buttons to jump back to specific steps
- Clear submission button
- Success state with confetti or celebration animation

---

## Visual Design Specifications

### Header Design
```tsx
<div className="bg-white pb-20 relative">
  <div className="px-5 pt-4 pb-3">
    <div className="flex items-center justify-between mb-3">
      {/* Back Button */}
      <button
        onClick={onBack}
        disabled={!canGoBack}
        className="p-1.5 -ml-1.5 hover:bg-stone-100 rounded-full transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-stone-800" />
      </button>

      {/* Step Counter */}
      <Badge variant="outline" className="text-xs text-stone-600 border-stone-300">
        Step {currentStep} of {totalSteps}
      </Badge>
    </div>

    {/* Progress Bar */}
    <div className="w-full bg-stone-200 rounded-full h-2">
      <div
        className="bg-gradient-to-r from-stone-600 to-stone-800 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      />
    </div>

    {/* Step Title */}
    <h1 className="text-lg font-bold text-stone-800 mt-3">
      {stepTitle}
    </h1>
    <p className="text-[11px] text-stone-500 mt-0.5">
      {stepDescription}
    </p>
  </div>
</div>
```

### Content Area Design
```tsx
<div
  className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-32"
  style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}
>
  <div className="px-5 pt-8 pb-6">
    {/* Form Fields */}
    <div className="space-y-5">
      {/* Individual form fields with proper spacing */}
    </div>
  </div>
</div>
```

### Bottom Navigation Design
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 safe-area-pb md:hidden">
  <div className="flex gap-3 max-w-md mx-auto">
    {currentStep > 1 && (
      <Button
        variant="outline"
        onClick={onPrevious}
        className="flex-1"
      >
        Previous
      </Button>
    )}

    <Button
      onClick={currentStep === totalSteps ? onSubmit : onNext}
      disabled={!canProceed || isSubmitting}
      className="flex-1 bg-stone-700 hover:bg-stone-800"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Submitting...
        </>
      ) : currentStep === totalSteps ? (
        <>
          <CheckCircle className="w-4 h-4 mr-2" />
          Submit Application
        </>
      ) : (
        'Next'
      )}
    </Button>
  </div>
</div>
```

---

## Responsive Behavior

### Mobile View (< 768px)
- Use new mobile components
- Full-screen form experience
- Bottom navigation bar
- Compact step indicator

### Desktop View (>= 768px)
- Keep current desktop implementation
- Or create an improved desktop layout later
- For now: `<div className="md:hidden">` for mobile, `<div className="hidden md:block">` for desktop

---

## Implementation Steps

### Phase 1: Create Mobile Components (Priority)
1. ✅ Create `MobileApplicationHeader` component
2. ✅ Create `MobileApplicationContent` wrapper component
3. ✅ Create `MobileApplicationNavigation` component
4. ✅ Create step-specific form components (mobile-step1 through mobile-step8)

### Phase 2: Refactor Main Page
1. ✅ Update `/src/app/business/apply/page.tsx`
2. ✅ Add mobile/desktop split with `md:hidden` and `hidden md:block`
3. ✅ Wire up mobile components with existing context
4. ✅ Ensure form validation works across both views

### Phase 3: Polish & Testing
1. ✅ Test all 8 steps on mobile viewport
2. ✅ Verify form submission flow
3. ✅ Check validation error display
4. ✅ Test navigation between steps
5. ✅ Verify success state on submission

### Phase 4: Success Page
1. ✅ Update `/src/app/business/apply/success/page.tsx` to follow pattern
2. ✅ Add mobile-optimized success UI

---

## Form Validation Strategy

### Validation Display on Mobile
- Errors appear directly below each field
- Red text with small font size
- Icon indicator for error state
- Prevent navigation to next step if validation fails
- Shake animation on submit with errors

### Validation Timing
- On blur for individual fields
- On submit for full step validation
- Real-time for password matching
- Email format validation on change

---

## Data Persistence

### Local Storage Strategy
- Save form data to localStorage on each change
- Restore data on page load/refresh
- Clear data on successful submission
- Provide "Save and continue later" option

### Context Integration
- Use existing `BusinessApplicationProvider`
- Ensure mobile and desktop share same state
- No changes needed to context logic

---

## Accessibility Considerations

### Mobile-Specific A11y
- Proper focus management between steps
- Announce step changes to screen readers
- Label all form fields clearly
- Ensure touch targets are 44x44px minimum
- Test with VoiceOver (iOS) and TalkBack (Android)

### Keyboard Navigation
- Support tab navigation
- Enter key to proceed to next step
- Escape key to go back (where appropriate)

---

## Performance Optimizations

### Mobile-Specific
- Lazy load step components
- Minimize re-renders with React.memo
- Use debouncing for auto-save
- Optimize images (business category icons)

### Bundle Size
- Code-split mobile/desktop views
- Only load required step components
- Minimize external dependencies

---

## Error Handling

### Mobile Error States
- Network errors: Retry button with clear messaging
- Validation errors: Inline with field highlighting
- Submission errors: Modal or toast notification
- Session timeout: Save progress and redirect to login

---

## Success State Design

### Mobile Success Page
- Celebration animation (confetti or checkmark)
- Clear next steps messaging
- Email verification status
- CTA to check email
- Secondary CTA to return home
- Follow mobile design pattern

---

## Testing Checklist

### Mobile Flow Testing
- [ ] All 8 steps render correctly on mobile
- [ ] Back button works on each step
- [ ] Next button validation works
- [ ] Form data persists across steps
- [ ] Submit button works on final step
- [ ] Success page renders correctly
- [ ] Error states display properly
- [ ] Navigation sticky positioning works
- [ ] Form inputs are touch-friendly
- [ ] Select dropdowns work on iOS and Android

### Cross-Browser Testing
- [ ] Safari iOS
- [ ] Chrome Android
- [ ] Firefox Mobile
- [ ] Samsung Internet

### Device Testing
- [ ] iPhone SE (375px width)
- [ ] iPhone 12 Pro (390px width)
- [ ] Pixel 5 (393px width)
- [ ] Galaxy S21 (412px width)

---

## Future Enhancements

### Phase 2 Features (Post-MVP)
1. **Step Progress Persistence**
   - Save-and-resume functionality
   - Email link to continue application

2. **Smart Form Features**
   - Address autocomplete
   - Bank branch code lookup
   - Business name availability check

3. **Enhanced UX**
   - Animations between steps
   - Haptic feedback on mobile
   - Voice input for text fields

4. **Improved Review Step**
   - Edit inline without going back
   - Photo previews
   - Summary cards for each section

---

## Technical Debt to Address

### Known Issues
1. Document upload step is placeholder only
2. Location coordinates not captured (no map integration)
3. No real-time business name validation
4. Bank verification not implemented

### Future Improvements
1. Add proper file upload for step 7
2. Integrate maps for location selection
3. Add real-time validation against database
4. Implement bank account verification API

---

## Dependencies

### Required Packages (Already Installed)
- `lucide-react` - Icons
- `@radix-ui/react-*` - UI components
- `tailwindcss` - Styling
- Next.js 15.5.7 - Framework

### No New Dependencies Required
- Use existing components
- Leverage current context system
- Build with existing UI library

---

## Files to Create/Modify

### New Files
```
/src/components/business/
├── mobile-application-header.tsx
├── mobile-application-content.tsx
├── mobile-application-navigation.tsx
└── application-steps/
    ├── mobile-step1-basic-info.tsx
    ├── mobile-step2-owner-details.tsx
    ├── mobile-step3-location.tsx
    ├── mobile-step4-registration.tsx
    ├── mobile-step5-locations.tsx
    ├── mobile-step6-operations.tsx
    ├── mobile-step7-documents.tsx
    └── mobile-step8-review.tsx
```

### Modified Files
```
/src/app/business/apply/page.tsx - Split mobile/desktop views
/src/app/business/apply/success/page.tsx - Follow mobile pattern
```

---

## Questions & Decisions

### Design Decisions Made
1. **Step Indicator**: Progress bar instead of numbered circles (better for mobile)
2. **Navigation**: Sticky bottom bar instead of inline buttons
3. **Forms**: One step per screen, no scrolling needed per step
4. **Location Manager**: Simplified list view instead of complex table

### Open Questions
1. Should we animate transitions between steps?
2. Do we need swipe gestures to navigate?
3. Should step 5 (locations) use a bottom sheet or inline forms?
4. Mobile-specific validation rules needed?

---

## Success Criteria

### Definition of Done
- [ ] All 8 steps work on mobile viewport (375px min)
- [ ] Form submission successfully creates application
- [ ] Mobile and desktop views coexist without conflicts
- [ ] All validation rules work on mobile
- [ ] Success page follows mobile pattern
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive on all breakpoints
- [ ] Passes accessibility audit
- [ ] Loading states work correctly

---

## Timeline Estimate

### Development Time
- **Phase 1** (Components): 4-6 hours
- **Phase 2** (Integration): 2-3 hours
- **Phase 3** (Polish): 2-3 hours
- **Phase 4** (Success Page): 1 hour
- **Total**: 9-13 hours of focused development

### Testing Time
- Mobile testing: 2 hours
- Cross-browser: 1 hour
- Bug fixes: 2-3 hours
- **Total**: 5-6 hours

**Grand Total**: 14-19 hours

---

## Notes

### Compatibility
- Maintains backward compatibility with desktop
- No breaking changes to context or API
- Can roll out mobile-first, desktop later

### Rollout Strategy
1. Develop mobile view alongside existing desktop
2. Test thoroughly on mobile devices
3. Deploy with feature flag if needed
4. Monitor analytics for completion rates
5. Iterate based on user feedback

---

## Reference Links

- [Mobile Design Pattern Doc](./MOBILE_DESIGN_PATTERN.md)
- [Business Application Context](./src/lib/context/business-application-context.tsx)
- [Account Mobile Examples](./src/components/account/)

---

**Document Status**: Ready for Implementation
**Next Action**: Begin Phase 1 - Create Mobile Components
