import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '@commudle/shared-services';
import { Subject } from 'rxjs';

@Component({
  selector: 'commudle-create-organization',
  templateUrl: './create-organization.component.html',
  styleUrls: ['./create-organization.component.scss'],
  standalone: false,
})
export class CreateOrganizationComponent implements OnInit, OnDestroy {
  organizationForm: FormGroup;
  isSubmitting = false;
  logoPreview: string | null = null;
  logoFile: File | null = null;
  subscriptionId: number | null = null;

  private destroy$ = new Subject<void>();
  private readonly MAX_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    const id = this.route.snapshot.queryParamMap.get('subscription_id');
    if (id) this.subscriptionId = +id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.organizationForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      mini_description: ['', [Validators.required, Validators.maxLength(255)]],
      description: [''],
      contact_email: ['', [Validators.email]],
      theme_color: [''],
      website: [''],
      twitter: [''],
      linkedin: [''],
      github: [''],
      facebook: [''],
    });
  }

  onLogoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.toastrService.warningDialog('Only PNG, JPG, JPEG images are allowed');
      return;
    }

    if (file.size > this.MAX_SIZE) {
      this.toastrService.warningDialog('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreview = reader.result as string;
      this.logoFile = file;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.logoPreview = null;
    this.logoFile = null;
  }

  submitForm(): void {
    if (this.organizationForm.invalid) {
      this.organizationForm.markAllAsTouched();
      this.toastrService.warningDialog('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    const formData = this.buildFormData();

    // TODO: Call API to create organization
    // this.communityGroupService.create(formData).subscribe({
    //   next: (org) => {
    //     this.toastrService.successDialog('Organization created successfully!');
    //     this.router.navigate(['/organizations', org.slug]);
    //   },
    //   error: () => {
    //     this.toastrService.errorDialog('Failed to create organization. Please try again.');
    //     this.isSubmitting = false;
    //   },
    // });

    // Temp: simulate success
    setTimeout(() => {
      this.toastrService.successDialog('Organization created successfully!');
      this.isSubmitting = false;
      this.router.navigate(['/subscriptions']);
    }, 1000);
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const values = this.organizationForm.value;

    const fields = [
      'name',
      'mini_description',
      'description',
      'contact_email',
      'theme_color',
      'website',
      'twitter',
      'linkedin',
      'github',
      'facebook',
    ];
    fields.forEach((key) => {
      if (values[key]) formData.append(`community_group[${key}]`, values[key]);
    });

    if (this.subscriptionId) {
      formData.append('community_group[user_subscription_id]', String(this.subscriptionId));
    }

    if (this.logoFile) formData.append('community_group[logo]', this.logoFile);

    return formData;
  }
}
