import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbDialogRef, NbButtonModule, NbInputModule, NbFormFieldModule, NbIconModule } from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { CommudleCardModule } from '@commudle/commudle-theme';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { ToastrService } from '@commudle/shared-services';
import { Router } from '@angular/router';
import { faXmark, faSpinner, faCheckCircle, faTimesCircle, faImage } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faTwitter, faGithub, faLinkedin, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'commudle-create-community-group-form',
  templateUrl: './create-community-group-form.component.html',
  styleUrls: ['./create-community-group-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    FontAwesomeModule,
    EditorModule,
    SharedComponentsModule,
    CommudleCardModule,
  ],
  providers: [{ provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }],
})
export class CreateCommunityGroupFormComponent implements OnInit, OnDestroy {
  @Input() subscriptionId: number;

  communityGroupForm: FormGroup;
  isSubmitting = false;
  isSlugEdited = false;
  slugCheckState: 'idle' | 'checking' | 'available' | 'taken' = 'idle';

  logoPreview: string | null = null;
  logoFile: File | null = null;
  themeColor = '#166534';

  readonly icons = {
    faXmark,
    faSpinner,
    faCheckCircle,
    faTimesCircle,
    faImage,
    faFacebook,
    faTwitter,
    faGithub,
    faLinkedin,
    faInstagram,
  };

  readonly allowedImageTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  readonly maxImageSize = 5 * 1024 * 1024;

  readonly tinyMCE = {
    min_height: 300,
    menubar: false,
    convert_urls: false,
    placeholder: 'Tell people what your organization is about...',
    content_style:
      "@import url('https://fonts.googleapis.com/css?family=Inter'); body { font-family: 'Inter'; font-size: 16px !important; }",
    plugins: [
      'advlist',
      'autolink',
      'lists',
      'link',
      'charmap',
      'preview',
      'anchor',
      'visualblocks',
      'code',
      'insertdatetime',
      'table',
      'help',
      'wordcount',
      'autoresize',
    ],
    toolbar: 'bold italic | link | alignleft aligncenter alignright | bullist numlist | removeformat',
    default_link_target: '_blank',
    branding: false,
    license_key: 'gpl',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<CreateCommunityGroupFormComponent>,
    private communityGroupsService: CommunityGroupsService,
    private toastrService: ToastrService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.communityGroupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      contact_email: ['', [Validators.required, Validators.email]],
      mini_description: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      theme_color: [this.themeColor],
      website: [''],
      facebook: [''],
      twitter: [''],
      github: [''],
      linkedin: [''],
      instagram: [''],
    });

    this.communityGroupForm
      .get('name')
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((name: string) => {
        if (!this.isSlugEdited) {
          this.communityGroupForm.get('slug').setValue(this.toSlug(name), { emitEvent: false });
          this.slugCheckState = 'idle';
        }
      });

    this.communityGroupForm
      .get('slug')
      .valueChanges.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((slug: string) => {
        if (slug && this.communityGroupForm.get('slug').valid) {
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

  onThemeColorChange(event: Event): void {
    this.themeColor = (event.target as HTMLInputElement).value;
    this.communityGroupForm.get('theme_color').setValue(this.themeColor);
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.isValidImage(file)) return;
    this.logoFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.logoPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoFile = null;
    this.logoPreview = null;
  }

  createCommunityGroup(): void {
    if (this.communityGroupForm.invalid || this.slugCheckState === 'taken' || this.slugCheckState === 'checking') {
      this.communityGroupForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const values = this.communityGroupForm.value;

    Object.keys(values).forEach((key) => {
      if (values[key] != null && values[key] !== '') {
        formData.append(`community_group[${key}]`, values[key]);
      }
    });

    if (this.logoFile) formData.append('community_group[logo]', this.logoFile);

    // this.communityGroupsService.create(formData, this.subscriptionId).subscribe({
    //   next: (communityGroup) => {
    //     this.isSubmitting = false;
    //     this.toastrService.successDialog('Organization created successfully!');
    //     this.dialogRef.close(communityGroup);
    //     this.router.navigate(['/orgs', communityGroup.slug]);
    //   },
    //   error: () => (this.isSubmitting = false),
    // });
  }

  close(): void {
    this.dialogRef.close();
  }

  private isValidImage(file: File): boolean {
    return this.allowedImageTypes.includes(file.type) && file.size <= this.maxImageSize;
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
    // TODO: replace with real API call e.g. this.communityGroupsService.checkSlug(slug)
    setTimeout(() => {
      this.slugCheckState = 'available';
    }, 600);
  }
}
