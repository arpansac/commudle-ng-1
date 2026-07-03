import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NbDialogRef, NbButtonModule, NbInputModule, NbFormFieldModule, NbIconModule } from '@commudle/theme';
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { CommudleCardModule } from '@commudle/commudle-theme';
import { CommunityGroupsService } from 'apps/commudle-admin/src/app/services/community-groups.service';
import { ToastrService, ConfettiService } from '@commudle/shared-services';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ICommunityGroup } from '@commudle/shared-models';

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
    SharedComponentsModule,
    CommudleCardModule,
  ],
})
export class CreateCommunityGroupFormComponent implements OnInit, OnDestroy {
  @Input() subscriptionId: number;

  communityGroupForm: FormGroup;
  isSubmitting = false;
  isSlugEdited = false;
  slugCheckState: 'idle' | 'checking' | 'available' | 'taken' = 'idle';
  createdCommunityGroup: ICommunityGroup | null = null;

  logoPreview: string | null = null;
  logoFile: File | null = null;
  themeColor = '#3366ff';

  private readonly allowedImageTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  private readonly maxImageSize = 5 * 1024 * 1024;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: NbDialogRef<CreateCommunityGroupFormComponent>,
    private communityGroupsService: CommunityGroupsService,
    private toastrService: ToastrService,
    private router: Router,
    private confettiService: ConfettiService,
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
          const slug = this.toSlug(name);
          this.communityGroupForm.get('slug').setValue(slug, { emitEvent: false });
          if (slug && this.communityGroupForm.get('slug').valid) {
            this.checkSlugAvailability(slug);
          } else {
            this.slugCheckState = 'idle';
          }
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
    if (!file) return;
    if (!this.allowedImageTypes.includes(file.type) || file.size > this.maxImageSize) {
      this.toastrService.warningDialog('Invalid image. Use PNG/JPG under 5MB.');
      return;
    }
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

    this.communityGroupsService.create(formData, this.subscriptionId).subscribe({
      next: (communityGroup: ICommunityGroup) => {
        this.isSubmitting = false;
        this.createdCommunityGroup = communityGroup;
        this.confettiService.celebrate();
      },
      error: () => {
        this.isSubmitting = false;
      },
    });
  }

  goToAdminPage(): void {
    if (!this.createdCommunityGroup) return;
    this.dialogRef.close(this.createdCommunityGroup);
    this.router.navigate(['/admin/orgs', this.createdCommunityGroup.slug]);
  }

  goToPublicPage(): void {
    if (!this.createdCommunityGroup) return;
    this.dialogRef.close(this.createdCommunityGroup);
    this.router.navigate(['/orgs', this.createdCommunityGroup.slug]);
  }

  createAnother(): void {
    this.createdCommunityGroup = null;
    this.communityGroupForm.reset({ theme_color: this.themeColor });
    this.logoPreview = null;
    this.logoFile = null;
    this.isSlugEdited = false;
    this.slugCheckState = 'idle';
  }

  close(): void {
    this.dialogRef.close(this.createdCommunityGroup ?? undefined);
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
    this.communityGroupsService
      .checkSlug(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.slugCheckState = res.available ? 'available' : 'taken'),
        error: () => (this.slugCheckState = 'idle'),
      });
  }
}
