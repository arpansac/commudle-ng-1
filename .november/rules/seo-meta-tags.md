# SEO Meta Tags Guidelines

## Every Routed Component Must Have SEO Tags

Mandatory: any component that's routed (has a path in a routing file) must
set SEO meta tags in `ngOnInit`.

## Implementation Pattern

```typescript
import { SeoService } from '@commudle/shared-services';

constructor(private seoService: SeoService) {}

ngOnInit() {
  this.seoService.setTags(
    'Page Title | Entity Name',
    'Description of the page content',
    'https://image-url-for-og-image.png',
  );
}
```

## Title Format

- Pipe separator: `Page Name | Parent Entity Name`.
- Under 60 characters when possible.
- Include the entity name (hackathon, community, event) for context.
- Examples: `Judges | ${this.hackathon.name}`,
  `Register for ${this.hackathon.name} | ${this.community.name}`,
  `${this.event.name} | ${this.community.name}`.

## Description Format

- Under 160 characters.
- Descriptive and action-oriented, include the entity name.
- Examples: `Meet the judges for ${this.hackathon.name} hackathon`,
  `Explore tracks and problem statements for ${this.hackathon.name} hackathon`,
  `Browse projects submitted for ${this.hackathon.name} hackathon`.

## OG Image

- Always provide a fallback.
- Use the entity's banner/header image when available.
- Fallback: `https://commudle.com/assets/images/commudle-logo192.png`.

```typescript
this.hackathon?.banner_image?.url || 'https://commudle.com/assets/images/commudle-logo192.png';
```

## Private/Auth Pages

Use `this.seoService.noIndex(true)` for pages that shouldn't be indexed —
dashboards, form pages, admin panels, anything authenticated-only.

```typescript
this.seoService.setTags(
  `Dashboard | ${this.hackathon.name}`,
  `Your team dashboard for ${this.hackathon.name} hackathon`,
  this.hackathon?.banner_image?.url || 'https://commudle.com/assets/images/commudle-logo192.png',
);
this.seoService.noIndex(true);
```

## When to Set SEO Tags

Set inside the `activatedRoute.data` (or `.parent.data`) subscription, once
entity data is available — always before any additional async fetching.

```typescript
ngOnInit() {
  this.activatedRoute.parent.data.subscribe((data) => {
    this.hackathon = data.hackathon;
    this.setSeo();      // SEO first
    this.fetchData();   // then additional data
  });
}
```

## Checklist for New Routed Components

1. Import `SeoService` from `@commudle/shared-services`.
2. Inject in constructor.
3. Call `setTags()` in `ngOnInit` after entity data is available.
4. Add `noIndex(true)` if the page is private/authenticated.
5. Use entity banner image with the Commudle logo fallback.