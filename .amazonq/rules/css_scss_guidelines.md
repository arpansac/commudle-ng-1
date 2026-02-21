# CSS/SCSS Guidelines

## File Organization

- Use dedicated `.scss` files for each component
- Keep styles scoped to component level
- Use CSS custom properties for theming

## Naming Conventions

- **ALWAYS use kebab-case for class names**: `.header-content`, `.form-group`
- **NEVER use BEM double underscores (`__`)**: Use `.community-controls-container` instead of `.community-controls__container`
- **NEVER use BEM double hyphens (`--`)**: Use `.button-primary-active` instead of `.button--primary`
- Prefix component-specific classes with component name using kebab-case
- Use descriptive, semantic class names that clearly indicate purpose

## Structure

**MANDATORY: Always use nested hierarchy for related classes**

```scss
// 1. Parent container with nested children
.parent-container {
  @apply com-flex com-flex-col;
  
  .child-element {
    @apply com-p-4 com-border;
    
    .nested-child {
      @apply com-text-sm com-text-gray-600;
    }
  }
  
  .another-child {
    @apply com-mt-4;
  }
}

// 2. Responsive styles within nested structure
.responsive-container {
  @apply com-w-full com-px-4;
  @apply md:com-w-1/2 md:com-px-8;
  
  .responsive-child {
    @apply com-text-sm md:com-text-base lg:com-text-lg;
  }
}
```

## Tailwind CSS Usage

- **NEVER use Tailwind classes directly in HTML templates**
- **NEVER use inline CSS or style attributes**
- Use `@apply` directive in SCSS files to apply Tailwind utilities
- **Always use `com-` prefix for Tailwind utilities in `@apply`**
- Create semantic class names that use Tailwind internally
- **ALWAYS refer to `tailwind.preset.js` for custom colors and configuration**
- **MANDATORY: Check `tailwind.preset.js` before writing any CSS/SCSS code**
- **NEVER use `primary-50`**: Use `primary-100` or higher values instead

```scss
.header-content {
  @apply com-flex com-justify-between com-items-center com-w-full;
}

.button-primary {
  @apply com-bg-primary-500 com-text-white com-px-4 com-py-2 com-rounded;
  @apply hover:com-bg-primary-600;
}
```

## Colors

- **NEVER use Nebular theme variables**
- **ALWAYS use Tailwind color utilities with `com-` prefix**
- **MANDATORY: Check `tailwind.preset.js` for available colors**
- Available Tailwind colors: gray, red, yellow, green, blue, indigo, purple, pink, orange
- Custom colors from preset: primary, Yankees-Blue, and other project-specific colors
- Use semantic color names: `com-text-gray-900`, `com-bg-primary-500`, `com-border-red-500`

```scss
// Good - Using Tailwind colors
.error-message {
  @apply com-text-red-600 com-bg-red-100 com-border com-border-red-500;
}

```

## Best Practices

- Use CSS Grid/Flexbox for layouts
- **NEVER use Nebular theme variables** - use Tailwind colors instead
- Keep specificity low
- Use semantic class names
- Group related properties together
- Add comments for complex styles
- Apply Tailwind utilities through `@apply` in SCSS files only

## Responsive Design

- Mobile-first approach
- **Use Tailwind breakpoints with `com-` prefix in `@apply`**
- Breakpoints: `sm:com-`, `md:com-`, `lg:com-`, `xl:com-`, `2xl:com-`
- Test on multiple screen sizes

```scss
.responsive-element {
  @apply com-w-full com-px-4;
  @apply md:com-w-1/2 md:com-px-8;
  @apply lg:com-w-1/3 lg:com-px-12;
}
```

## Nesting Rules

- **MANDATORY: Always nest related child classes under their parent classes**
- **NEVER write standalone classes that belong to a parent component**
- Use proper hierarchy: `.parent { .child { .nested-child { } } }`
- Maximum nesting depth: 3 levels for performance
- Group related elements under their logical parent

## Performance

- Avoid deep nesting (max 3 levels)
- Use efficient selectors
- Minimize use of `!important`
- Optimize for reusability
- Follow nested hierarchy for better maintainability