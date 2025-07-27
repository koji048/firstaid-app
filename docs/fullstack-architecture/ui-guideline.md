# UX-UI Guidelines

## Design Philosophy

The Inquiry App follows IBM's minimal design philosophy, emphasizing clarity, functionality, and sophisticated simplicity. Our design system is inspired by IBM Quantum's ultra-clean aesthetic, focusing on generous spacing, minimal color usage, and purposeful interactions.

### Core Principles

1. **Clarity Above All**: Every element serves a purpose
2. **Generous Spacing**: Content breathes with ample whitespace
3. **Minimal Color Palette**: Strategic use of color for emphasis
4. **Sharp Corners**: No rounded corners - maintaining IBM's distinctive aesthetic
5. **Light Typography**: Elegant, readable text with light font weights
6. **Data-First Design**: Let the content shine

## Design Tokens

### Colors

```css
/* Primary Palette */
--ibm-blue: #0f62fe;          /* Primary actions, links */
--ibm-blue-hover: #0043ce;    /* Hover state for blue elements */
--ibm-text-primary: #161616;  /* Main content text */
--ibm-text-secondary: #525252;/* Secondary information */
--ibm-text-helper: #6f6f6f;   /* Helper text, captions */

/* Background Colors */
--ibm-bg-primary: #ffffff;    /* Main background */
--ibm-bg-secondary: #f4f4f4;  /* Section backgrounds */
--ibm-bg-tertiary: #e0e0e0;   /* Subtle backgrounds */
--ibm-bg-hover: rgba(0, 0, 0, 0.05);

/* Status Colors */
--ibm-success: #24a148;       /* Success states */
--ibm-error: #da1e28;         /* Error states */
--ibm-warning: #f1c21b;       /* Warning states */
--ibm-orange: #f1620e;        /* Special highlights */
--ibm-purple: #8a3ffc;        /* Premium features */

/* Borders */
--ibm-border: #e0e0e0;        /* Default borders */
--ibm-border-subtle: #c6c6c6; /* Emphasized borders */
```

### Dark Mode Colors

```css
/* Dark Mode Adjustments */
--ibm-blue: #78a9ff;          /* Softer blue for dark */
--ibm-text-primary: #f4f4f4;  /* Light text on dark */
--ibm-text-secondary: #c6c6c6;/* Enhanced contrast */
--ibm-bg-primary: #161616;    /* Dark background */
--ibm-bg-secondary: #262626;  /* Elevated surfaces */
```

### Typography

```css
/* Font Family */
--ibm-font-family: 'IBM Plex Sans', -apple-system, sans-serif;

/* Font Sizes */
--ibm-font-size-xs: 0.75rem;   /* 12px - Labels, captions */
--ibm-font-size-sm: 0.875rem;  /* 14px - Body text */
--ibm-font-size-base: 1rem;    /* 16px - Default */
--ibm-font-size-lg: 1.125rem;  /* 18px - Emphasized text */
--ibm-font-size-xl: 1.25rem;   /* 20px - Section headers */
--ibm-font-size-2xl: 1.5rem;   /* 24px - Page headers */
--ibm-font-size-3xl: 2rem;     /* 32px - Hero text */

/* Font Weights */
300 - Light (Headlines, large numbers)
400 - Regular (Body text)
500 - Medium (Emphasis)
600 - Semibold (Active states, important labels)
```

### Spacing System

Based on 8px grid system:

```css
--ibm-spacing-01: 0.125rem;  /* 2px - Minimal spacing */
--ibm-spacing-02: 0.25rem;   /* 4px - Tight spacing */
--ibm-spacing-03: 0.5rem;    /* 8px - Base unit */
--ibm-spacing-04: 0.75rem;   /* 12px - Small padding */
--ibm-spacing-05: 1rem;      /* 16px - Default padding */
--ibm-spacing-06: 1.5rem;    /* 24px - Section spacing */
--ibm-spacing-07: 2rem;      /* 32px - Large spacing */
--ibm-spacing-08: 2.5rem;    /* 40px - Extra spacing */
--ibm-spacing-09: 3rem;      /* 48px - Maximum spacing */
```

## Layout Guidelines

### Page Structure

```tsx
<MinimalLayout maxWidth="7xl" padding="xl">
  {/* Content */}
</MinimalLayout>
```

**Padding Guidelines:**
- Mobile: `px-12 py-8` (48px horizontal, 32px vertical)
- Desktop: `px-16 py-12` (64px horizontal, 48px vertical)
- Sections: `mb-24` between major sections
- Components: `p-8` for cards and containers

### Grid System

- Use CSS Grid or Flexbox with consistent gaps
- Standard gap: `gap-8` (32px)
- Tight gap: `gap-4` (16px)
- Wide gap: `gap-12` (48px)

### Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape */
xl: 1280px  /* Desktop */
2xl: 1536px /* Wide desktop */
```

## Component Guidelines

### Buttons

**Primary Button**
```tsx
<button className="ibm-btn-primary">
  Action
</button>
```

**Secondary Button**
```tsx
<button className="ibm-btn-secondary">
  Alternative
</button>
```

**Ghost Button**
```tsx
<button className="ibm-btn-ghost">
  Subtle Action
</button>
```

**Button States:**
- Default: Base color
- Hover: Darker shade with transition
- Active: Even darker shade
- Disabled: 50% opacity
- Focus: 2px outline with --ibm-focus color

### Form Elements

**Input Fields**
```tsx
<div>
  <label className="ibm-label">Field Label</label>
  <input className="ibm-input" />
  <span className="ibm-helper-text">Helper text</span>
</div>
```

**Select Dropdowns**
```tsx
<select className="ibm-select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Cards and Containers

**Basic Card**
```tsx
<div className="ibm-card">
  {/* Content */}
</div>
```

**Metric Card**
```tsx
<MetricCard
  label="Response Time"
  before={3.2}
  after={0.8}
  unit="s"
  improvement={75}
/>
```

### Status Indicators

**Tags**
```tsx
<span className="ibm-tag">Default</span>
<span className="ibm-tag-success">Success</span>
<span className="ibm-tag-error">Error</span>
<span className="ibm-tag-warning">Warning</span>
```

### Data Tables

```tsx
<table className="ibm-data-table">
  <thead>
    <tr>
      <th>Column</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Data</td>
    </tr>
  </tbody>
</table>
```

## Interaction Patterns

### Transitions

```css
/* Fast: Micro-interactions */
--ibm-transition-fast: 70ms cubic-bezier(0.2, 0, 0.38, 0.9);

/* Base: Most interactions */
--ibm-transition-base: 110ms cubic-bezier(0.2, 0, 0.38, 0.9);

/* Slow: Complex animations */
--ibm-transition-slow: 240ms cubic-bezier(0.2, 0, 0.38, 0.9);
```

### Hover States

- Subtle background change: `var(--ibm-bg-hover)`
- Color transitions for interactive elements
- No scale transforms (except special cases)
- Maintain sharp corners

### Focus States

- 2px solid outline in `--ibm-focus` color
- No border-radius on focus rings
- Clear keyboard navigation path

## Special Effects

### Gradient Text (Use Sparingly)

```css
.gradient-text {
  background: linear-gradient(135deg, var(--ibm-blue) 0%, var(--ibm-purple) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Hover Accents

```css
.ibm-metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--ibm-blue) 0%, var(--ibm-purple) 100%);
  opacity: 0;
  transition: opacity var(--ibm-transition-base);
}

.ibm-metric-card:hover::before {
  opacity: 1;
}
```

## Chat Interface Guidelines

### Message Layout

- User messages: Right-aligned with subtle background
- AI messages: Left-aligned with different background
- Generous padding: `p-4` minimum
- Clear message separation: `mb-4`

### Input Area

- Fixed bottom position
- Clean border separation
- Large, accessible input field
- Clear send button

## Dashboard Guidelines

### Metric Display

- Large, light font weight for values
- Small, uppercase labels
- Clear improvement indicators
- Minimal color usage

### Chart Styling

- Clean axes with minimal lines
- IBM color palette for data series
- No rounded corners on bars
- Subtle grid lines

## Accessibility

### Color Contrast

- Maintain WCAG AA compliance minimum
- Test all color combinations
- Provide high contrast mode option

### Keyboard Navigation

- All interactive elements keyboard accessible
- Clear focus indicators
- Logical tab order
- Skip links for main content

### Screen Readers

- Proper ARIA labels
- Semantic HTML structure
- Descriptive link text
- Alt text for all images

## Implementation Examples

### Dashboard Page

```tsx
<MinimalLayout>
  <h1 className="text-6xl font-light gradient-text mb-4">
    Performance Analytics
  </h1>
  <p className="text-xl text-ibm-text-secondary mb-24">
    Real-time system performance metrics
  </p>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
    <MetricCard {...props} />
  </div>
</MinimalLayout>
```

### Form Page

```tsx
<div className="max-w-2xl mx-auto">
  <h2 className="text-2xl font-light mb-8">
    Configuration Settings
  </h2>
  
  <div className="space-y-6">
    <div>
      <label className="ibm-label">Setting Name</label>
      <input className="ibm-input" />
    </div>
  </div>
</div>
```

## Do's and Don'ts

### Do's

- ✅ Use generous whitespace
- ✅ Maintain consistent spacing
- ✅ Keep color usage minimal
- ✅ Use light font weights for headlines
- ✅ Let data be the focus
- ✅ Maintain sharp corners
- ✅ Use subtle hover effects

### Don'ts

- ❌ Don't use rounded corners
- ❌ Don't overcrowd layouts
- ❌ Don't use too many colors
- ❌ Don't use heavy font weights unnecessarily
- ❌ Don't add decorative elements
- ❌ Don't use drop shadows (except specific cases)
- ❌ Don't animate excessively

## Testing Guidelines

### Visual Testing

1. Check spacing consistency across all breakpoints
2. Verify color contrast ratios
3. Test dark mode appearance
4. Validate focus states
5. Ensure sharp corners everywhere

### Interaction Testing

1. Test all hover states
2. Verify keyboard navigation
3. Check transition smoothness
4. Test loading states
5. Validate error states

## Maintenance

### Regular Reviews

- Monthly design system audit
- Quarterly accessibility review
- Component consistency check
- Performance impact assessment

### Documentation Updates

- Keep examples current
- Document new patterns
- Remove deprecated styles
- Update color values as needed

---

*Last Updated: 2025-07-27*
*Version: 1.0*