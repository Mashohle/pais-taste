# Mobile Design Pattern Documentation

## Overview
This document outlines the consistent mobile design pattern used throughout the customer-facing mobile application. This pattern creates a modern, app-like experience with layered UI elements and smooth visual hierarchy.

## Core Design Pattern: Header + Content Overlap

### Visual Structure
The mobile UI follows a two-layer design pattern:
1. **Header Section**: White background with bottom padding
2. **Content Section**: Rounded-top card that overlaps the header

This creates a visually appealing layered effect with depth and modern aesthetics.

---

## Header Component Pattern

### Styling Requirements
```tsx
<div className="bg-white pb-20 relative">
  <div className="px-5 pt-4 pb-3">
    <div className="flex items-center gap-2">
      <button className="p-1.5 -ml-1.5 hover:bg-stone-100 rounded-full transition-colors flex items-center justify-center">
        <ChevronLeft className="w-5 h-5 text-stone-800" />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-stone-500 mt-0.5 leading-tight">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
</div>
```

### Key Properties
- **Background**: `bg-white` - Clean white background
- **Bottom Padding**: `pb-20` (80px) - Creates space for content overlap
- **Side Padding**: `px-5` (20px) - Consistent horizontal margins
- **Top/Bottom Padding**: `pt-4 pb-3` - Compact header spacing

### Header Elements
1. **Layout**
   - Flexbox with `flex items-center gap-2`
   - Back button and title/subtitle in same row
   - Compact and efficient use of space

2. **Back Button** (if applicable)
   - Size: `w-5 h-5` (20px icon)
   - Padding: `p-1.5` (6px)
   - Stone-800 color for contrast
   - Hover state: `hover:bg-stone-100`
   - Rounded full for circular appearance

3. **Title Text**
   - Font: `text-xl font-bold` - Compact size
   - Style: Gradient text using `bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent`
   - Leading: `leading-tight` for compact line height
   - Container: `flex-1 min-w-0` to take remaining space

4. **Subtitle** (optional)
   - Font: `text-[11px] text-stone-500` - Very small for minimal visual weight
   - Spacing: `mt-0.5` - Tight spacing from title
   - Leading: `leading-tight` for compact line height
   - Used for additional context or counts

---

## Content Component Pattern

### Styling Requirements
```tsx
<div
  className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24"
  style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}
>
  <div className="px-5 pt-8">
    {/* Content goes here */}
  </div>
</div>
```

### Key Properties
- **Background**: `bg-stone-50` - Subtle off-white background
- **Top Border Radius**: `rounded-t-[2.5rem]` (40px) - Large rounded corners on top only
- **Negative Margin**: `-mt-20` (-80px) - Overlaps the header by 80px
- **Z-Index**: `relative z-10` - Ensures content appears above header
- **Min Height**: `min-h-screen` - Ensures content fills viewport
- **Bottom Padding**: `pb-24` (96px) - Space for bottom navigation
- **Inset Shadow**: Creates subtle depth effect at the top edge

### Content Inner Padding
- **Horizontal**: `px-5` (20px) - Matches header padding
- **Top**: `pt-8` (32px) - Space from rounded edge to content

---

## Implementation Examples

### Example 1: Directory Page
**Components**:
- `MobileDirectoryHeader` - Header with search bar
- `MobileDirectoryContent` - Business grid with filters

**File Locations**:
- `/src/components/directory/mobile-directory-header.tsx`
- `/src/components/directory/mobile-directory-content.tsx`

**Usage**:
```tsx
<div className="md:hidden min-h-screen bg-stone-50">
  <MobileDirectoryHeader
    searchTerm={searchTerm}
    onSearchChange={setSearchTerm}
  />
  <MobileDirectoryContent
    businesses={businesses}
    onFilterClick={() => setShowFilters(true)}
    activeFilterCount={activeFilterCount}
    onClearFilters={clearFilters}
  />
</div>
```

### Example 2: Business Detail Page
**Components**:
- `MobileBusinessHeader` - Header with business logo and back button
- `MobileBusinessContent` - Business details and ordering interface

**File Locations**:
- `/src/components/business/mobile-business-header.tsx`
- `/src/components/business/mobile-business-content.tsx`

**Special Features**:
- Sticky top bar that appears on scroll
- Business logo/icon display
- Gradient overlay for visual depth

### Example 3: Account Landing Page
**Components**:
- `MobileAccountHeader` - Header with user avatar and info (gradient variant)
- `MobileAccountContent` - Menu grid with navigation cards

**File Locations**:
- `/src/components/account/mobile-account-header.tsx`
- `/src/components/account/mobile-account-content.tsx`

**Note**: This uses a gradient header variant (`bg-gradient-to-br from-stone-600 to-stone-800`) for visual distinction as the main account page.

### Example 4: Account Sub-Pages
**Component**:
- `MobilePageHeader` - Reusable header for all account sub-pages

**File Location**:
- `/src/components/account/mobile-page-header.tsx`

**Pages Using This Pattern**:
- Edit Profile (`/src/app/account/profile/page.tsx`)
- Active Orders (`/src/app/account/orders/page.tsx`)
- Order History (`/src/app/account/history/page.tsx`)
- Settings (`/src/app/account/settings/page.tsx`)

**Usage**:
```tsx
<div className="md:hidden min-h-screen bg-stone-50">
  <MobilePageHeader
    title="Page Title"
    subtitle="Optional subtitle"
  />
  <div className="bg-stone-50 rounded-t-[2.5rem] -mt-20 relative z-10 min-h-screen pb-24"
       style={{ boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)' }}>
    <div className="px-5 pt-8">
      {/* Page content */}
    </div>
  </div>
</div>
```

---

## Design Principles

### 1. Visual Hierarchy
- Headers establish context and navigation
- Content area is the primary focus
- Overlap creates natural visual flow

### 2. Consistency
- All mobile pages use the same spacing values
- Color palette remains consistent (stone shades)
- Border radius values are standardized

### 3. Touch-Friendly
- Back buttons are easily tappable (44px × 44px minimum)
- Adequate spacing between interactive elements
- Bottom padding accounts for bottom navigation

### 4. Performance
- Minimal shadow effects (only inset shadow on content)
- CSS-based gradients (no images)
- Simple border radius calculations

---

## Color Palette

### Text Colors
- **Primary Title**: Gradient from `stone-600` to `stone-800`
- **Subtitle/Secondary**: `stone-500`
- **Body Text**: `stone-700` to `stone-900`

### Background Colors
- **Header**: `white`
- **Content Area**: `stone-50`
- **Hover States**: `stone-100`

### Interactive Elements
- **Back Button**: `stone-800` with `stone-100` hover
- **Icons**: `stone-600` to `stone-800`

---

## Spacing Scale

### Standard Spacing Values (Tailwind)
- `px-5` = 20px (horizontal padding)
- `pt-4` = 16px (header top padding)
- `pb-3` = 12px (header bottom padding)
- `pt-8` = 32px (content top padding)
- `pb-20` = 80px (header overlap padding)
- `pb-24` = 96px (content bottom padding for nav clearance)
- `-mt-20` = -80px (overlap offset)
- `gap-2` = 8px (spacing between elements)
- `mt-0.5` = 2px (subtitle top margin)

### Border Radius
- Header: None (square edges)
- Content: `rounded-t-[2.5rem]` = 40px (top only)

---

## Responsive Behavior

### Mobile-First Approach
```tsx
<div className="md:hidden">
  {/* Mobile layout with pattern */}
</div>

<div className="hidden md:block">
  {/* Desktop layout */}
</div>
```

### Breakpoint
- **Mobile**: Below 768px (`md:hidden`)
- **Desktop**: 768px and above (`hidden md:block`)

---

## Pages Currently Using This Pattern

### Implemented ✅
1. **Directory Page** (`/directory`)
   - Business listing and search
   - Filter interface

2. **Business Detail Page** (`/business/[id]`)
   - Business information
   - Ordering/booking interface

3. **Account Landing** (`/account`)
   - User profile overview
   - Navigation menu (gradient header variant)

4. **Edit Profile** (`/account/profile`)
   - Profile editing form

5. **Active Orders** (`/account/orders`)
   - Current orders listing

6. **Order History** (`/account/history`)
   - Past orders listing

7. **Settings** (`/account/settings`)
   - App preferences

### Pending Implementation 🔄
The following pages should be refactored to use this pattern:

1. **Home Page** (`/`)
   - Category browsing
   - Featured businesses

2. **Login/Auth Pages** (`/login`, `/signup`)
   - Authentication forms
   - Email verification

3. **Reviews Page** (`/account/reviews`)
   - User reviews management
   - Write review interface

4. **Order Detail Pages** (`/account/orders/[id]`)
   - Individual order tracking
   - Order details

5. **Booking Detail Pages** (`/account/bookings/[id]`)
   - Individual booking details
   - Booking management

6. **Any other modal/standalone pages**

---

## Implementation Checklist

When implementing this pattern on a new page:

- [ ] Create or use existing header component with white background and `pb-24`
- [ ] Include back button if navigating from another page
- [ ] Use gradient text for title (`bg-gradient-to-r from-stone-600 to-stone-800 bg-clip-text text-transparent`)
- [ ] Add optional subtitle with `text-xs text-stone-500`
- [ ] Wrap content in rounded container with `rounded-t-[2.5rem]` and `-mt-20`
- [ ] Apply `bg-stone-50` background to content area
- [ ] Add inset shadow: `boxShadow: 'inset 0 8px 12px -8px rgba(0,0,0,0.15)'`
- [ ] Include `px-5 pt-8` padding inside content wrapper
- [ ] Add `pb-24` to content for bottom navigation clearance
- [ ] Ensure `min-h-screen` for full height
- [ ] Test on actual mobile devices for visual consistency
- [ ] Verify smooth scroll behavior
- [ ] Check back button functionality

---

## Common Pitfalls to Avoid

1. **Incorrect Overlap Math**
   - Header must have `pb-20` (80px padding)
   - Content must have `-mt-20` (-80px margin)
   - This creates perfect overlap alignment

2. **Missing Z-Index**
   - Content needs `relative z-10` to appear above header
   - Without it, elements may render incorrectly

3. **Inconsistent Padding**
   - Always use `px-5` for horizontal padding
   - Both header and content should match

4. **Shadow Not Applied**
   - Inset shadow must be inline style, not className
   - Creates important visual depth

5. **Bottom Navigation Overlap**
   - Always include `pb-24` on content for clearance
   - Prevents content from being hidden behind bottom nav

---

## Future Considerations

1. **Dark Mode Support**
   - Header: `dark:bg-stone-900`
   - Content: `dark:bg-stone-800`
   - Text gradients: Adjust for visibility

2. **Animation Enhancements**
   - Consider fade-in animations for content
   - Smooth transitions on navigation

3. **Accessibility**
   - Ensure back buttons have aria-labels
   - Maintain focus management
   - Test with screen readers

4. **Performance Optimization**
   - Consider lazy loading for content below fold
   - Optimize shadow rendering if performance issues arise

---

## Questions & Support

For questions about implementing this pattern:
1. Review existing implementations in the codebase
2. Check component files in `/src/components/`
3. Test on mobile viewport (375px width minimum)
4. Refer to this document for specifications

**Last Updated**: 2025-12-08
**Pattern Version**: 1.0
