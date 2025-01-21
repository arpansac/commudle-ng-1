import { Component, OnDestroy, OnInit } from '@angular/core';
import { IBlog } from 'apps/commudle-admin/src/app/feature-modules/public-blogs/models/blogs.model';
import { environment } from 'apps/commudle-admin/src/environments/environment';
import { CmsService } from 'apps/shared-services/cms.service';
import { SeoService } from 'apps/shared-services/seo.service';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppUsersService } from 'apps/commudle-admin/src/app/services/app-users.service';

@Component({
  selector: 'app-blogs',
  templateUrl: './blogs-list.component.html',
  styleUrls: ['./blogs-list.component.scss'],
})
export class BlogsListComponent implements OnInit, OnDestroy {
  blogs: IBlog[];
  featuredBlogs: IBlog[];
  isLoading = true;
  isLoadingFeatured = true;
  environment = environment;
  tags: {
    slug: string;
    value: string;
  }[] = [];
  defaultTag = {
    slug: 'all',
    value: 'all',
  };
  activeTag = 'all';
  schemaForHackathon = [];

  constructor(
    private cmsService: CmsService,
    private seoService: SeoService,
    private footerService: FooterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private appUsersService: AppUsersService,
  ) {}

  imageUrl(source: any) {
    return this.cmsService.getImageUrl(source);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const tag = params['tag'];
      if (tag) {
        const tag = {
          value: this.slugToText(params['tag']),
          slug: params['tag'],
        };
        this.setActiveTag(tag);
      } else {
        this.setActiveTag(this.defaultTag);
      }
    });
    this.footerService.changeFooterStatus(true);
    this.getFeaturedBlogs();
    this.getTags();
    this.setMeta();
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
  }

  getBlogs() {
    const fields = '_id,slug,title,publishedAt,meta_description,headerImage, username';
    const order = 'publishedAt desc';
    this.cmsService.getDataByTypeFieldOrder('blog', fields, order).subscribe((value: IBlog[]) => {
      this.blogs = value;
      this.setSchema();
      this.isLoading = false;
    });
  }

  getFeaturedBlogs(): void {
    const fields = '_id,slug,title,publishedAt,meta_description,headerImage, username';
    const order = 'publishedAt desc';
    this.cmsService
      .getDataByTypeFilterFieldOrderCount('blog', fields, order, 'isFeatured', true, 3)
      .subscribe((value: IBlog[]) => {
        this.featuredBlogs = value;
        this.isLoadingFeatured = false;
      });
  }

  getTags(): void {
    const fields = 'tags, publishedAt';
    const order = 'publishedAt desc';
    this.cmsService.getDataByTypeFieldOrder('blog', fields, order).subscribe((value: IBlog[]) => {
      value.forEach((blog) => {
        if (blog.tags) {
          blog.tags.forEach((tag) => {
            if (!this.tags.some((existingTag) => existingTag.value === tag.value)) {
              this.tags.push({ slug: this.generateSlug(tag.value), value: tag.value });
            }
          });
        }
      });
    });
  }

  generateSlug(text: string): string {
    return text
      .trim() // Remove leading & trailing spaces
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
  }

  slugToText(slug: string): string {
    return slug.replace(/-/g, ' '); // Replace hyphens with spaces
  }

  getFilteredData(tag) {
    this.isLoading = true;
    if (tag === this.defaultTag.slug) {
      this.getBlogs();
    } else {
      this.cmsService.getDataByTypeWithFilter('blog', 'tags[].value', tag, 10).subscribe((data) => {
        if (data) {
          this.blogs = data;
          this.setSchema();
          this.isLoading = false;
        }
      });
    }
  }

  setActiveTag(tag): void {
    this.activeTag = tag.value;
    if (tag.slug == this.defaultTag.slug) {
      this.router.navigate(['/blogs']);
    } else {
      this.router.navigate(['/blogs/category', tag.slug]);
    }
    this.getFilteredData(tag.value);
  }

  setMeta(): void {
    this.seoService.setTags(
      'Commudle Blog: Insights from DevRels and Developer Communities',
      'Explore the latest in developer relations and community building. Discover expert DevRel interviews, community success stories, and engagement tips. Elevate your developer communities today',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  async setSchema() {
    for (const blog of this.blogs) {
      const authorName = await this.getUser(blog.username);
      this.schemaForHackathon.push({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${environment.app_url}/blogs/${blog.slug.current}`,
        },
        headline: blog.title,
        description: blog.meta_description,
        image: this.imageUrl(blog.headerImage).url(),
        author: {
          type: 'Person',
          name: authorName,
          url: `${environment.app_url}/users/${blog.username}`,
        },
        datePublished: blog.publishedAt,
      });
    }
    this.seoService.setSchema(this.schemaForHackathon);
  }

  getUser(username): Promise<string> {
    return this.appUsersService
      .getProfile(username)
      .toPromise()
      .then((user) => user.name);
  }
}
