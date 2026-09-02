# Tailwind UI Blocks — Reference & Usage Rules

## Purpose

Tailwind UI Blocks is the primary visual reference for layout and
structural UI. Always write component code from scratch, using Tailwind
UI block patterns as the structural and compositional guide — never
copying code directly.

---

## Priority Hierarchy

| Priority | Source                      | Used For                                                 |
| -------- | --------------------------- | -------------------------------------------------------- |
| 1st      | Tailwind UI block patterns  | Layout, structure, cards, lists, sections, page patterns |
| 2nd      | Nebular (`@commudle/theme`) | Buttons, modals, forms, toasts, tabs — always Nebular    |
| 3rd      | Custom SCSS                 | Only when neither above applies                          |

---

## Scope Boundaries

**Use Tailwind UI patterns for:** page sections, cards, lists, table
layouts, empty states, nav shells (breadcrumbs, pagination), modal/panel
structure, notification/banner shells, form layouts.

**Never replace these with Tailwind UI:** buttons (`nbButton`), form
controls, toasts, tabs, modal behavior — always Nebular.

---

## How Components Get Written

Identify the closest Tailwind UI block category for the requested
component, then write the layout from scratch following that structural
convention — adapted fully to project standards from the first keystroke.
No raw Tailwind UI code at any point.

When a close Tailwind UI pattern exists, follow its composition closely.
When nothing matches, construct a Tailwind-idiomatic layout that fits
naturally alongside the existing block patterns.

### Reference Patterns by Component Type

Project-valid starting structures, extended and customized per
requirement:

**Cards**

```html
<div class="com-rounded-10 com-shadow-Card com-bg-white com-p-6px">
  <div class="com-flex com-items-center com-gap-4">
    <!-- avatar / icon slot -->
    <div class="com-flex-1 com-min-w-0">
      <!-- title + meta -->
    </div>
    <!-- action slot -->
  </div>
</div>
```

**Stacked Lists**

```html
<ul class="com-divide-y com-divide-Bright-Gray">
  <li class="com-flex com-items-center com-gap-4 com-py-4">
    <!-- avatar -->
    <div class="com-flex-1 com-min-w-0">
      <p class="com-text-Paragraph-1 com-text-Yankees-Blue com-truncate">Name</p>
      <p class="com-text-Paragraph-2 com-text-Cadet-Grey com-truncate">Meta</p>
    </div>
    <!-- action -->
  </li>
</ul>
```

**Section with Heading**

```html
<div class="com-mx-auto com-max-w-7xl com-px-6px lg:com-px-8">
  <div class="com-mx-auto com-max-w-2xl lg:com-text-center">
    <p class="com-text-Paragraph-2 com-font-semibold com-text-primary-600">Label</p>
    <h2 class="com-text-Page-Heading com-font-bold com-text-Yankees-Blue">Heading</h2>
    <p class="com-text-Paragraph-1 com-text-Cadet-Grey">Supporting text</p>
  </div>
</div>
```

**Stats**

```html
<dl class="com-grid com-grid-cols-1 sm:com-grid-cols-3 com-gap-4">
  <div class="com-rounded-10 com-bg-white com-shadow-Card com-p-6px">
    <dt class="com-text-Paragraph-2 com-text-Cadet-Grey">Label</dt>
    <dd class="com-text-Page-Subheading com-font-bold com-text-Yankees-Blue">Value</dd>
  </div>
</dl>
```

**Empty States**

```html
<div class="com-text-center com-py-12">
  <!-- icon -->
  <h3 class="com-text-Card-Subheading com-font-semibold com-text-Yankees-Blue">No results</h3>
  <p class="com-text-Paragraph-2 com-text-Cadet-Grey com-mt-2px">Supporting message</p>
  <!-- action button via nbButton -->
</div>
```

**Tables**

```html
<div class="com-overflow-hidden com-rounded-10 com-shadow-Card">
  <table class="com-min-w-full com-divide-y com-divide-Bright-Gray">
    <thead class="com-bg-gray-50">
      <tr>
        <th
          class="com-px-6px com-py-4 com-text-Paragraph-2 com-font-semibold
                   com-text-Yankees-Blue com-text-left"
        >
          Column
        </th>
      </tr>
    </thead>
    <tbody class="com-divide-y com-divide-Bright-Gray com-bg-white">
      <tr>
        <td class="com-px-6px com-py-4 com-text-Paragraph-1 com-text-Yankees-Blue">Cell</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Token Mapping Quick Reference

| Tailwind UI Convention | Project Equivalent             |
| ---------------------- | ------------------------------ |
| `text-2xl`             | `com-text-Page-Section-Header` |
| `text-xl`              | `com-text-Page-Subheading`     |
| `text-lg`              | `com-text-Card-Subheading`     |
| `text-base`            | `com-text-Paragraph-1`         |
| `text-sm`              | `com-text-Paragraph-2`         |
| `text-xs`              | `com-text-Caption`             |
| `text-gray-400`        | `com-text-Cadet-Grey`          |
| `bg-gray-50`           | `com-bg-Ghost-White`           |
| `text-blue-600`        | `com-text-primary-600`         |
| `bg-blue-50`           | `com-bg-Lavender`              |
| `text-red-500`         | `com-text-Infra-Red`           |
| `text-green-600`       | `com-text-Caribbean-Green`     |
| `shadow-md`            | `com-shadow-Card`              |
| `rounded-lg`           | `com-rounded-10`               |

> This table maps generic Tailwind UI conventions to preferred project
> tokens for reference during translation. Both sides of this table are
> actually valid classes now, confirmed against the real
> `tailwind.preset.js` (this config extends Tailwind's defaults rather
> than replacing them) — the right column is just the preferred choice,
> not the only working one. See `design-guardrails.md` for the full
> token list and the preference-vs-fallback policy.

---

## Angular Integration

Every component is standalone per `reusable-components.md`. Use
`TemplateRef` for variable content, typed `@Input()` config interfaces,
selector `commudle-[feature-name]`.

---

## Commit Convention

```bash
feat(ui): add stat-card component based on tailwind stats block pattern
feat(ui): add activity-feed component using stacked-list pattern
```

---

## Pre-Submit Checklist

- [ ] Layout follows the closest Tailwind UI block pattern
- [ ] All code written from scratch — no raw Tailwind UI source used
- [ ] All project token rules applied from the first line
- [ ] Nebular used for all interactive elements
- [ ] Wrapped as a standalone Angular component
