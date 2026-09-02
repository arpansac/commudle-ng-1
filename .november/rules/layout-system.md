# Layout System Documentation

## Overview

Commudle uses a flexible, responsive grid-based layout system built with Tailwind CSS utilities. The system provides predefined layout patterns for consistent page structure across the application.

## Base Layout Structure

### Standard HTML Structure

```html
<div class="base-layout">
  <div class="container">
    <!-- Layout content here -->
  </div>
</div>
```

### Base Layout Variants

#### Default (Extra Large)
```html
<div class="base-layout">
  <div class="container">
    <!-- Max width: 1280px (screen-xl) -->
  </div>
</div>
```

#### Medium
```html
<div class="base-layout medium">
  <div class="container">
    <!-- Max width: 1024px (screen-lg) -->
  </div>
</div>
```

#### Thin
```html
<div class="base-layout thin">
  <div class="container">
    <!-- Max width: 768px (screen-md) -->
  </div>
</div>
```

### Base Layout Classes

```scss
.base-layout {
  @apply com-min-h-screen com-max-w-screen-xl com-mx-auto;

  &.thin {
    @apply com-max-w-screen-md;
  }

  &.medium {
    @apply com-max-w-screen-lg;
  }

  .container {
    @apply com-container;
  }
}
```

## Grid Layout System

The layout system uses a 24-column grid at large breakpoints (lg and above), collapsing to single column on mobile.

### One Column Layout

```html
<div class="one-column-layout">
  <div>Full width content</div>
</div>
```

**Behavior:**
- Mobile: Full width (24 columns)
- Desktop: Full width (24 columns)

```scss
.one-column-layout {
  @apply com-grid com-grid-cols-24;

  & > * {
    @apply com-col-span-full;
  }
}
```

### Two Column Layout

#### Standard Two Column

```html
<div class="two-column-layout">
  <div class="left-column">Sidebar content</div>
  <div class="main-column">Main content</div>
</div>
```

**OR**

```html
<div class="two-column-layout">
  <div class="main-column">Main content</div>
  <div class="right-column">Sidebar content</div>
</div>
```

**Column Spans (Default):**
- Mobile: 1 column (full width)
- Desktop (lg+):
  - `left-column` / `right-column`: 5/24 columns (~20%)
  - `main-column`: 19/24 columns (~80%)

#### Two Column Variants

**Thin Variant**
```html
<div class="two-column-layout thin">
  <div class="left-column">Sidebar</div>
  <div class="main-column">Main</div>
</div>
```
- Desktop: Sidebar (4/24), Main (20/24)

**Medium Variant**
```html
<div class="two-column-layout medium">
  <div class="main-column">Main</div>
  <div class="right-column">Sidebar</div>
</div>
```
- Desktop: Sidebar (7/24), Main (17/24)

**Wide Variant**
```html
<div class="two-column-layout wide">
  <div class="left-column">Sidebar</div>
  <div class="main-column">Main</div>
</div>
```
- Desktop: Sidebar (6/24), Main (18/24)

**Equal Columns**
```html
<div class="two-column-layout equal-columns">
  <div class="left-column">Left half</div>
  <div class="right-column">Right half</div>
</div>
```
- Desktop: Each column (12/24) - 50/50 split

#### Mobile Reverse

**Standard Reverse**
```html
<div class="two-column-layout mobile-reverse">
  <div class="left-column">Shown second on mobile</div>
  <div class="main-column">Shown first on mobile</div>
</div>
```

**Equal Columns Reverse**
```html
<div class="two-column-layout mobile-reverse-equal-columns">
  <div class="left-column">Shown second on mobile</div>
  <div class="right-column">Shown first on mobile</div>
</div>
```

### Two Column SCSS Definition

```scss
.two-column-layout {
  @apply com-grid com-grid-cols-1;

  &.mobile-reverse {
    .main-column {
      @apply com-row-start-2;
    }
  }

  &.mobile-reverse-equal-columns {
    .left-column {
      @apply com-order-2 md:com-order-1;
    }
    .right-column {
      @apply com-order-1 md:com-order-2;
    }
  }

  @screen lg {
    @apply com-grid com-grid-cols-24;

    .left-column,
    .right-column {
      @apply com-col-span-5;
    }

    .main-column {
      @apply com-col-span-19;
    }

    &.thin {
      .left-column,
      .right-column {
        @apply com-col-span-4;
      }

      .main-column {
        @apply com-col-span-20;
      }
    }

    &.medium {
      .left-column,
      .right-column {
        @apply com-col-span-7;
      }

      .main-column {
        @apply com-col-span-17;
      }
    }

    &.wide {
      .left-column,
      .right-column {
        @apply com-col-span-6;
      }

      .main-column {
        @apply com-col-span-18;
      }
    }

    &.equal-columns {
      .left-column,
      .right-column {
        @apply com-col-span-12;
      }
    }

    &.mobile-reverse {
      .main-column {
        @apply com-row-start-1;
      }
    }
  }
}
```

### Three Column Layout

```html
<div class="three-column-layout">
  <div class="left-column">Left sidebar</div>
  <div class="center-column">Main content</div>
  <div class="right-column">Right sidebar</div>
</div>
```

**Column Spans (Default):**
- Mobile: 1 column (stacked vertically)
- Desktop (lg+):
  - Left column: 6/24 columns (25%)
  - Center column: 12/24 columns (50%)
  - Right column: 6/24 columns (25%)

#### Three Column Variants

**Medium Variant**
```html
<div class="three-column-layout medium">
  <div>Left (5/24)</div>
  <div>Center (12/24)</div>
  <div>Right (7/24)</div>
</div>
```

**Thin Variant**
```html
<div class="three-column-layout thin">
  <div>Left (7/24)</div>
  <div>Center (9/24)</div>
  <div>Right (8/24)</div>
</div>
```

### Three Column SCSS Definition

```scss
.three-column-layout {
  @screen lg {
    @apply com-grid com-grid-cols-24;

    & > *:nth-child(1) {
      @apply com-col-span-6;
    }

    & > *:nth-child(2) {
      @apply com-col-span-12;
    }

    & > *:nth-child(3) {
      @apply com-col-span-6;
    }

    &.medium {
      & > *:nth-child(1) {
        @apply com-col-span-5;
      }

      & > *:nth-child(2) {
        @apply com-col-span-12;
      }

      & > *:nth-child(3) {
        @apply com-col-span-7;
      }
    }

    &.thin {
      & > *:nth-child(1) {
        @apply com-col-span-7;
      }

      & > *:nth-child(2) {
        @apply com-col-span-9;
      }

      & > *:nth-child(3) {
        @apply com-col-span-8;
      }
    }
  }
}
```

## Special Layout Classes

### Center Column

Used within grid layouts for centered main content:

```scss
.center-column {
  @apply com-w-full md:com-px-0 com-px-3 md:com-col-span-3 com-col-span-1;
}
```

### Left/Right Columns (Component Level)

```scss
.left-column {
  @apply md:com-pr-6;
}

.right-column {
  @apply md:com-pl-6 com-w-full;
}
```

### Main Column (Component Level)

```scss
.main-column {
  @apply com-p-0 com-border-0 com-border-r-0 com-border-solid com-border-Bright-Gray;
  @apply lg:com-mb-8 lg:com-pr-6 lg:com-border-r;
}
```

## Layout Components

### Listing Pages Layout Component

Pre-built component for two-column listing pages with responsive behavior.

**Usage:**
```html
<commudle-listing-pages-layout>
  <div header>
    <h1>Page Header</h1>
  </div>
  
  <div one-column>
    <!-- Mobile: Shows this -->
    <div>Mobile optimized content</div>
  </div>
  
  <div main-column>
    <!-- Desktop: Shows this in main area -->
    <div>Main content</div>
  </div>
  
  <div right-column>
    <!-- Desktop: Shows this in sidebar -->
    <div>Sidebar content</div>
  </div>
</commudle-listing-pages-layout>
```

**Structure:**
```html
<div>
  <ng-content select="[header]"></ng-content>
</div>
<div class="com-bg-white">
  <div class="base-layout">
    <div class="container">
      <div *appBreakpoints="'<=lg'" class="one-column-layout">
        <ng-content select="[one-column]"></ng-content>
      </div>
      <div *appBreakpoints="'>lg'" class="two-column-layout medium">
        <div class="main-column">
          <ng-content select="[main-column]"></ng-content>
        </div>
        <div class="right-column">
          <ng-content select="[right-column]"></ng-content>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Public Page Layout Component

Simple flex-based section layout for landing pages.

**Usage:**
```html
<commudle-public-page-layout [imageOnLeft]="true">
  <div content>
    <h2>Feature Title</h2>
    <p>Feature description</p>
  </div>
  <div image>
    <img src="feature.png" alt="Feature">
  </div>
</commudle-public-page-layout>
```

## Responsive Breakpoints

The layout system uses Tailwind's default breakpoints:

- **Mobile**: < 640px (default, no prefix)
- **sm**: ≥ 640px
- **md**: ≥ 768px
- **lg**: ≥ 1024px (main breakpoint for grid layouts)
- **xl**: ≥ 1280px
- **2xl**: ≥ 1536px

## Breakpoint Directive

Use the `appBreakpoints` directive for conditional rendering:

```html
<!-- Show only on mobile and tablet -->
<div *appBreakpoints="'<=lg'">
  Mobile/Tablet content
</div>

<!-- Show only on desktop -->
<div *appBreakpoints="'>lg'">
  Desktop content
</div>

<!-- Show only on medium and above -->
<div *appBreakpoints="'>md'">
  Medium+ content
</div>
```

## Common Layout Patterns

### Dashboard Layout (Three Column)

```html
<div class="dashboard">
  <div class="base-layout">
    <div class="container">
      <div class="three-column-layout">
        <div class="left-column">
          <!-- User profile, navigation -->
        </div>
        <div class="center-column">
          <!-- Main dashboard content -->
        </div>
        <div class="right-column" *appBreakpoints="'>md'">
          <!-- Sidebar widgets, ads -->
        </div>
      </div>
    </div>
  </div>
</div>
```

### Content Page with Sidebar (Two Column)

```html
<div class="base-layout">
  <div class="container">
    <div class="two-column-layout medium">
      <div class="main-column">
        <!-- Article, content -->
      </div>
      <div class="right-column">
        <!-- Related content, author info -->
      </div>
    </div>
  </div>
</div>
```

### Centered Content (Thin)

```html
<div class="base-layout thin">
  <div class="container">
    <div class="one-column-layout">
      <div>
        <!-- Centered blog post, form -->
      </div>
    </div>
  </div>
</div>
```

### Split Screen (Equal Columns)

```html
<div class="base-layout">
  <div class="container">
    <div class="two-column-layout equal-columns">
      <div class="left-column">
        <!-- Left content -->
      </div>
      <div class="right-column">
        <!-- Right content -->
      </div>
    </div>
  </div>
</div>
```

## Best Practices

### 1. Always Wrap in Base Layout

```html
<!-- ✅ Correct -->
<div class="base-layout">
  <div class="container">
    <div class="two-column-layout">
      <!-- content -->
    </div>
  </div>
</div>

<!-- ❌ Wrong -->
<div class="two-column-layout">
  <!-- content -->
</div>
```

### 2. Use Correct Column Classes

```html
<!-- ✅ Correct -->
<div class="two-column-layout">
  <div class="left-column">Sidebar</div>
  <div class="main-column">Content</div>
</div>

<!-- ❌ Wrong -->
<div class="two-column-layout">
  <div>Sidebar</div>
  <div>Content</div>
</div>
```

### 3. Choose Appropriate Width Variant

- **Default**: Wide pages with significant sidebar content
- **Medium**: Balanced content and sidebar
- **Thin**: Content-focused pages (blogs, articles)

### 4. Mobile-First Approach

Always consider mobile experience:
- Content stacks vertically on mobile
- Use `mobile-reverse` when needed
- Hide non-essential sidebars with `*appBreakpoints`

### 5. Consistent Spacing

Use component-level column classes for consistent padding:

```scss
.left-column {
  @apply md:com-pr-6;
}

.right-column {
  @apply md:com-pl-6;
}
```

## File Locations

### Core Layout Styles
- **Grid System**: `apps/commudle-admin/src/assets/styles/grid.scss`
- **Common Classes**: `apps/commudle-admin/src/assets/styles/common-classes.scss`

### Layout Components
- **Listing Pages Layout**: `apps/commudle-admin/src/app/app-shared-components/listing-pages-layout/`
- **Public Page Layout**: `apps/commudle-admin/src/app/app-shared-components/public-page-layout/`

### Example Usage
- **User Dashboard**: `apps/commudle-admin/src/app/feature-modules/dashboard/components/user-dashboard/`
- **Speaker Resource**: `apps/commudle-admin/src/app/feature-modules/speaker-resources/components/speaker-resource/`

## Quick Reference

| Layout | Mobile | Desktop (lg+) | Use Case |
|--------|--------|---------------|----------|
| **one-column-layout** | Full width | Full width | Full-width content |
| **two-column-layout** | Stacked | 5/19 split | Main + sidebar |
| **two-column-layout medium** | Stacked | 7/17 split | Balanced content |
| **two-column-layout thin** | Stacked | 4/20 split | Content-focused |
| **two-column-layout wide** | Stacked | 6/18 split | Wide sidebar |
| **two-column-layout equal-columns** | Stacked | 12/12 split | Split screen |
| **three-column-layout** | Stacked | 6/12/6 split | Dashboard |
| **three-column-layout medium** | Stacked | 5/12/7 split | Asymmetric layout |
| **three-column-layout thin** | Stacked | 7/9/8 split | Narrow center |

## Summary

The Commudle layout system provides:
- ✅ Consistent, responsive grid-based layouts
- ✅ Mobile-first approach with automatic stacking
- ✅ Multiple width variants (thin, medium, default)
- ✅ Pre-built layout components
- ✅ 24-column grid for precise control
- ✅ Tailwind CSS utilities with `com-` prefix
- ✅ Breakpoint directive for conditional rendering
