import { Component, OnDestroy, OnInit } from '@angular/core';
import { IBlog } from 'apps/commudle-admin/src/app/feature-modules/public-blogs/models/blogs.model';
import { environment } from 'apps/commudle-admin/src/environments/environment';
import { CmsService } from 'apps/shared-services/cms.service';
import { SeoService } from 'apps/shared-services/seo.service';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  tags: string[] = [];
  activeTag = 'all';

  constructor(
    private cmsService: CmsService,
    private seoService: SeoService,
    private footerService: FooterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {}

  imageUrl(source: any) {
    return this.cmsService.getImageUrl(source);
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      const tag = params['tag'];
      if (tag) {
        this.setActiveTag(tag);
      } else {
        this.setActiveTag('all');
      }
    });
    this.footerService.changeFooterStatus(true);
    this.getBlogs();
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
            if (!this.tags.includes(tag.value)) {
              this.tags.push(tag.value);
            }
          });
        }
      });
    });
  }

  getFilteredData(tag: string) {
    this.isLoading = true;
    if (tag === 'all') {
      this.getBlogs();
    } else {
      this.cmsService.getDataByTypeWithFilter('blog', 'tags[].value', tag, 10).subscribe((data) => {
        if (data) {
          this.blogs = data;
          this.isLoading = false;
        }
      });
    }
  }

  setActiveTag(tag: string): void {
    this.activeTag = tag;
    if (tag == 'all') {
      this.router.navigate(['/blogs']);
    } else {
      this.router.navigate(['/blogs/category', tag]);
    }
    this.getFilteredData(tag);
  }

  setMeta(): void {
    this.seoService.setTags(
      'Relating with Developers & Communities',
      'Blogs in the form of experiences and knowledge, authored by Developers, Designers, Community Managers and DevRels',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }
}
