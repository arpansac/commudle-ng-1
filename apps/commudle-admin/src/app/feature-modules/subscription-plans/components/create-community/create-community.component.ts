import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IUserSubscription, ISubscriptionCommunityGroup } from '@commudle/shared-models';
import { ToastrService, UserSubscriptionService } from '@commudle/shared-services';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'commudle-create-community',
  templateUrl: './create-community.component.html',
  styleUrls: ['./create-community.component.scss'],
  standalone: false,
})
export class CreateCommunityComponent implements OnInit, OnDestroy {
  communityForm: FormGroup;
  isSubmitting = false;
  isLoadingSubscription = false;
  logoPreview: string | null = null;
  bannerPreview: string | null = null;
  logoFile: File | null = null;
  bannerFile: File | null = null;

  // Auto-detected from subscription
  subscription: IUserSubscription | null = null;
  autoOrg: ISubscriptionCommunityGroup | null = null; // set if org plan

  private destroy$ = new Subject<void>();
  private readonly MAX_SIZE = 5 * 1024 * 1024;
  private readonly ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private userSubscriptionService: UserSubscriptionService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.loadSubscriptionFromRoute();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    this.communityForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      mini_description: ['', [Validators.required, Validators.maxLength(160)]],
      about: [''],
      location: [''],
      contact_email: ['', [Validators.email]],
      community_group_id: [null],
      website: ['', [Validators.pattern('https?://.+')]],
      twitter: [''],
      linkedin: [''],
      github: [''],
      instagram: [''],
      facebook: [''],
    });
  }

  private loadSubscriptionFromRoute(): void {
    const subscriptionId = this.route.snapshot.queryParamMap.get('subscription_id');
    if (!subscriptionId) return;

    this.isLoadingSubscription = true;
    this.userSubscriptionService
      .getSubscription(+subscriptionId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sub) => {
          this.subscription = sub;
          // If org plan, auto-set community_group_id
          if (sub.community_groups_list?.length > 0) {
            this.autoOrg = sub.community_groups_list[0];
            this.communityForm.get('community_group_id').setValue(this.autoOrg.id);
          }
          this.isLoadingSubscription = false;
        },
        error: () => (this.isLoadingSubscription = false),
      });
  }

  onImageChange(event: Event, type: 'logo' | 'banner'): void {
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
      if (type === 'logo') {
        this.logoPreview = reader.result as string;
        this.logoFile = file;
      } else {
        this.bannerPreview = reader.result as string;
        this.bannerFile = file;
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage(type: 'logo' | 'banner'): void {
    if (type === 'logo') {
      this.logoPreview = null;
      this.logoFile = null;
    } else {
      this.bannerPreview = null;
      this.bannerFile = null;
    }
  }

  submitForm(): void {
    if (this.communityForm.invalid) {
      this.communityForm.markAllAsTouched();
      this.toastrService.warningDialog('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;
    const formData = this.buildFormData();

    // TODO: Call API to create community
    // this.communityService.create(formData).subscribe({
    //   next: (community) => {
    //     this.toastrService.successDialog('Community created successfully!');
    //     this.router.navigate(['/communities', community.slug]);
    //   },
    //   error: () => {
    //     this.toastrService.errorDialog('Failed to create community. Please try again.');
    //     this.isSubmitting = false;
    //   },
    // });

    setTimeout(() => {
      this.toastrService.successDialog('Community created successfully!');
      this.isSubmitting = false;
      this.router.navigate(['/subscriptions']);
    }, 1000);
  }

  private buildFormData(): FormData {
    const formData = new FormData();
    const values = this.communityForm.value;

    const fields = [
      'name',
      'mini_description',
      'about',
      'location',
      'contact_email',
      'website',
      'twitter',
      'linkedin',
      'github',
      'instagram',
      'facebook',
    ];
    fields.forEach((key) => {
      if (values[key]) formData.append(`kommunity[${key}]`, values[key]);
    });

    if (values.community_group_id) {
      formData.append('kommunity[community_group_id]', values.community_group_id);
    }

    if (this.logoFile) formData.append('kommunity[logo_image]', this.logoFile);
    if (this.bannerFile) formData.append('kommunity[banner_image]', this.bannerFile);

    return formData;
  }
}
