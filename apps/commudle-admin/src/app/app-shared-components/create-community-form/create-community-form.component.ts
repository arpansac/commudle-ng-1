import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbDialogRef, NbButtonModule, NbInputModule, NbFormFieldModule, NbIconModule } from '@commudle/theme';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { CommudleCardModule } from '@commudle/commudle-theme';
import { CommunitiesService } from 'apps/commudle-admin/src/app/services/communities.service';
import { ToastrService } from '@commudle/shared-services';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ICommunity } from '@commudle/shared-models';

@Component({
  selector: 'commudle-create-community-form',
  templateUrl: './create-community-form.component.html',
  styleUrls: ['./create-community-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    EditorModule,
    SharedComponentsModule,
    CommudleCardModule,
  ],
  providers: [{ provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }],
})
export class CreateCommunityFormComponent implements OnInit, OnDestroy {
  @Input() subscriptionId: number;

  communityForm: FormGroup;
  isSubmitting = false;
  isSlugEdited = false;
  slugCheckState: 'idle' | 'checking' | 'available' | 'taken' = 'idle';

  logoPreview: string | null = null;
  logoFile: File | null = null;
  bannerPreview: string | null = null;
  bannerFile: File | null = null;

  readonly tinyMCE = {
    min_height: 200,
    menubar: false,
    convert_urls: false,
    placeholder: 'Tell people what your community is about...',
    content_style:
      "@import url('https://fonts.googleapis.com/css?family=Inter'); body { font-family: 'Inter'; font-size: 14px !important; }",
    plugins: ['autolink', 'lists', 'link', 'autoresize'],
    toolbar: 'bold italic | link | bullist numlist | removeformat',
    default_link_target: '_blank',
    branding: false,
    license_key: 'gpl',
  };

  private readonly allowedImageTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  private readonly maxImageSize = 5 * 1024 * 1024;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<CreateCommunityFormComponent>,
    private communitiesService: CommunitiesService,
    private toastrService: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.communityForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      contact_email: ['', [Validators.required, Validators.email]],
      mini_description: ['', [Validators.required, Validators.maxLength(200)]],
      about: [''],
      location: [''],
      website: [''],
      facebook: [''],
      twitter: [''],
      github: [''],
      linkedin: [''],
      instagram: [''],
    });

    this.communityForm
      .get('name')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((name: string) => {
        if (!this.isSlugEdited) {
          const slug = this.toSlug(name);
          this.communityForm.get('slug').setValue(slug, { emitEvent: false });
          if (slug && this.communityForm.get('slug').valid) {
            this.checkSlugAvailability(slug);
          } else {
            this.slugCheckState = 'idle';
          }
        }
      });

    this.communityForm
      .get('slug')
      .valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((slug: string) => {
        if (slug && this.communityForm.get('slug').valid) {
          this.checkSlugAvailability(slug);
        } else {
          this.slugCheckState = 'idle';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSlugInput(): void {
    this.isSlugEdited = true;
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!this.isValidImage(file)) {
      this.toastrService.warningDialog('Invalid image. Use PNG/JPG under 5MB.');
      return;
    }
    this.logoFile = file;
    this.readPreview(file, (r) => (this.logoPreview = r));
  }

  onBannerSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!this.isValidImage(file)) {
      this.toastrService.warningDialog('Invalid image. Use PNG/JPG under 5MB.');
      return;
    }
    this.bannerFile = file;
    this.readPreview(file, (r) => (this.bannerPreview = r));
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
  }
  removeBanner(): void {
    this.bannerFile = null;
    this.bannerPreview = null;
  }

  createCommunity(): void {
    if (this.communityForm.invalid || this.slugCheckState === 'taken' || this.slugCheckState === 'checking') {
      this.communityForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const values = this.communityForm.value;

    Object.keys(values).forEach((key) => {
      if (values[key] != null && values[key] !== '') {
        formData.append(`community[${key}]`, values[key]);
      }
    });

    if (this.logoFile) formData.append('community[logo_image]', this.logoFile);
    if (this.bannerFile) formData.append('community[banner_image]', this.bannerFile);

    this.communitiesService.createWithSubscription(formData, this.subscriptionId).subscribe({
      next: (community: ICommunity) => {
        this.isSubmitting = false;
        this.toastrService.successDialog('Community created successfully!');
        this.dialogRef.close(community);
        this.router.navigate(['/communities', community.slug]);
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  private isValidImage(file: File): boolean {
    return this.allowedImageTypes.includes(file.type) && file.size <= this.maxImageSize;
  }

  private readPreview(file: File, cb: (r: string) => void): void {
    const reader = new FileReader();
    reader.onload = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  }

  private toSlug(value: string): string {
    return (value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private checkSlugAvailability(slug: string): void {
    this.slugCheckState = 'checking';
    this.communitiesService
      .checkSlug(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.slugCheckState = res.available ? 'available' : 'taken'),
        error: () => (this.slugCheckState = 'idle'),
      });
  }
}
