import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICampaign, ICampaignAsset, ECampaignTypeSlug } from '@commudle/shared-models';
import { CampaignService, GoogleTagManagerService, SeoService, ToastrService } from '@commudle/shared-services';
import { faPlus, faXmark, faArrowRight, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { combineLatest, debounceTime, filter, Subscription } from 'rxjs';

@Component({
    selector: 'commudle-campaign-form-order-setup',
    templateUrl: './campaign-form-order-setup.component.html',
    styleUrls: ['./campaign-form-order-setup.component.scss'],
    standalone: false
})
export class CampaignFormOrderSetupComponent implements OnInit, OnDestroy {
  fragment: string;
  campaignForm: FormGroup;
  icons = {
    faPlus,
    faXmark,
    faArrowRight,
    faFileImage,
  };
  campaign: ICampaign;
  imagePreview = [];
  tags = [];

  formSubscription: Subscription;
  ECampaignTypeSlug = ECampaignTypeSlug;

  constructor(
    private activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private campaignService: CampaignService,
    private toasterService: ToastrService,
    private router: Router,
    private seoService: SeoService,
    private gtm: GoogleTagManagerService,
  ) {
    this.campaignForm = this._fb.group(
      {
        name: ['', [Validators.required, Validators.pattern(/^\S*$/)]], //campaign name
        contact_name: ['', Validators.required],
        contact_email: ['', [Validators.required, Validators.email]],
        company_name: ['', Validators.required],
        start_time: [''],
        end_time: [''],
        start_date: [''],
        end_date: [''],
        budget: [0, Validators.required],
        campaign_assets: this._fb.array([this.createCampaignAsset()]),
      },
      {
        validator: this.endDateValidator, // Add the custom validator
      },
    );
  }

  endDateValidator(formGroup: AbstractControl): ValidationErrors | null {
    const startDate = formGroup.get('start_date')?.value;
    const endDate = formGroup.get('end_date')?.value;

    if (!startDate || !endDate) return null; // No validation if either date is missing

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure end date is at least 3 days after the start date
    const minEndDate = new Date(start);
    minEndDate.setDate(minEndDate.getDate() + 3);

    return end < minEndDate ? { endDateValidator: true } : null;
  }

  createCampaignAsset(asset?: ICampaignAsset): FormGroup {
    return this._fb.group({
      id: [asset ? asset?.id : ''],
      image: [asset ? asset?.image?.url : null, Validators.required],
      headline: [asset ? asset?.headline : '', Validators.required],
      url: [asset ? asset?.url : '', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]], // Ensure URL is valid
    });
  }

  get campaignAssets(): FormArray {
    return this.campaignForm.get('campaign_assets') as FormArray;
  }

  addCampaignAsset() {
    this.campaignAssets.push(this.createCampaignAsset());
  }

  removeCampaignAsset(index: number) {
    this.campaignAssets.removeAt(index);
  }

  ngOnInit() {
    this.checkFragment();
    this.subscribeToFormChanges();
    this.activatedRoute.parent.data.subscribe((data) => {
      this.campaign = data['campaign'];
      this.patchCampaignForm();
      this.seoService.setTags(
        `Edit ${this.campaign.name} Campaign - Set Time & Budget`,
        'Set the campaign name, time, budget, tags and other details.',
        'https://commudle.com/assets/images/commudle-logo192.png',
      );
    });
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  patchCampaignForm() {
    if (this.campaign.name) {
      this.campaignForm.patchValue({
        name: this.campaign.name,
        contact_name: this.campaign.contact_name,
        contact_email: this.campaign.contact_email,
        company_name: this.campaign.company_name,
        start_time: this.convertUtcTimeToLocalString(this.campaign.start_time.toString()),
        end_time: this.convertUtcTimeToLocalString(this.campaign.end_time.toString()),
        start_date: this.campaign.start_date,
        end_date: this.campaign.end_date,
        budget: this.campaign.budget,
      });
      if (this.campaign.tags) {
        this.tags = this.campaign.tags;
      }

      if (this.campaign.campaign_assets.length > 0) {
        // Patch Campaign Assets (FormArray)
        const campaignAssetsFormArray = this.campaignForm.get('campaign_assets') as FormArray;

        // Clear existing items in the FormArray
        campaignAssetsFormArray.clear();

        // Loop through campaign_assets and add them to the FormArray
        this.campaign.campaign_assets.forEach((asset, index) => {
          campaignAssetsFormArray.push(this.createCampaignAsset(asset));
          this.imagePreview[index] = asset.image.url;
        });
      }
    }

    if (this.campaign.campaign_type.slug === ECampaignTypeSlug.MAIN_NEWSLETTER) {
      this.campaignService.calculateBudget(this.campaign.id).subscribe((data) => {
        this.campaignForm.patchValue({ budget: data });
      });
    }
  }

  private convertUtcTimeToLocalString(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);

    // Create a Date in UTC
    const utcDate = new Date();
    utcDate.setUTCHours(hours, minutes, 0, 0);

    // Convert to local time
    const localHours = utcDate.getHours().toString().padStart(2, '0');
    const localMinutes = utcDate.getMinutes().toString().padStart(2, '0');

    return `${localHours}:${localMinutes}`;
  }

  onFileChange(event: any, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      this.toasterService.warningDialog('Please upload a valid image file (PNG, JPG, JPEG)');
      event.target.value = '';
      return;
    }

    if (file.size > maxSize) {
      this.toasterService.warningDialog('The image size should not exceed 2 MB.');
      event.target.value = '';
      return;
    }

    // Check for image dimensions
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      if (
        img.width !== this.campaign.campaign_type.image_dimension?.width ||
        img.height !== this.campaign.campaign_type.image_dimension?.height
      ) {
        this.toasterService.warningDialog(
          'Image must be exactly ' +
            this.campaign.campaign_type.image_dimension.width +
            ' X ' +
            this.campaign.campaign_type.image_dimension.height +
            ' pixels.',
        );
        event.target.value = ''; // Reset input field
        return;
      }

      // Ensure `campaignAssets` is correctly accessed as FormArray
      const campaignAssets = this.campaignForm.get('campaign_assets') as FormArray;
      if (campaignAssets && campaignAssets.at(index)) {
        campaignAssets.at(index).patchValue({ image: file });
        campaignAssets.at(index).get('image')?.updateValueAndValidity();

        // Display image preview
        this.previewImage(file, index);
      }
    };

    img.onerror = () => {
      this.toasterService.warningDialog('Invalid image file.');
      event.target.value = '';
    };
  }

  previewImage(file: File, i) {
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview[i] = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  handleInput(value: string | number, key: string) {
    this.campaignForm.patchValue({ [key]: value });
  }

  handleArrayFormInput(value: string | number, key: string, index: number, formArrayName: string) {
    const formArray = this.campaignForm.get(formArrayName) as FormArray;

    if (formArray && formArray.controls[index]) {
      formArray.at(index).patchValue({ [key]: value });
    }
  }

  updateCampaign() {
    const formData = new FormData();
    const formValue = this.campaignForm.value;

    // Append non-file fields to FormData
    formData.append('campaign[name]', formValue.name);
    formData.append('campaign[contact_name]', formValue.contact_name);
    formData.append('campaign[contact_email]', formValue.contact_email);
    formData.append('campaign[company_name]', formValue.company_name);

    const combinedStart = `${formValue.start_date}T${formValue.start_time}:00`; // add seconds
    const combinedEnd = `${formValue.end_date}T${formValue.end_time}:00`;

    const startTimeUtc = new Date(combinedStart).toISOString();
    const endTimeUtc = new Date(combinedEnd).toISOString();

    formData.append('campaign[start_time]', startTimeUtc);
    formData.append('campaign[end_time]', endTimeUtc);

    // formData.append('campaign[start_time]', formValue.start_time);
    // formData.append('campaign[end_time]', formValue.end_time);

    formData.append('campaign[start_date]', formValue.start_date);
    formData.append('campaign[end_date]', formValue.end_date);
    formData.append('campaign[budget]', formValue.budget);

    // Append campaign assets
    formValue.campaign_assets.forEach((asset, index) => {
      formData.append(`campaign[campaign_assets[${index}][headline]]`, asset.headline);
      formData.append(`campaign[campaign_assets[${index}][url]]`, asset.url);
      formData.append(`campaign[campaign_assets[${index}][id]]`, asset.id);

      if (asset.image instanceof File) {
        formData.append(`campaign[campaign_assets[${index}][image]]`, asset.image);
      }
    });

    this.campaignService.updateCampaign(formData, this.campaign.id).subscribe((data) => {
      if (data) {
        this.gtmDataLayerPushEvent('new-campaign-step-2-created', {
          com_campaign_id: this.campaign.id,
          com_campaign_type_name: this.campaign.campaign_type.name,
        });
        this.submitTags();
      }
    });
  }

  checkFragment() {
    this.activatedRoute.fragment.subscribe((fragment) => {
      if (fragment) {
        requestAnimationFrame(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest',
            });
          }
        });
      }
    });
  }

  generateCampaignName() {
    const companyName = this.campaignForm.get('company_name')?.value?.trim().replace(/\s+/g, '-') || '';
    const contactName = this.campaignForm.get('contact_name')?.value?.trim().replace(/\s+/g, '-') || '';

    let campaignName = '';

    if (companyName && contactName) {
      campaignName = `${companyName}-${contactName}`;
    } else if (companyName) {
      campaignName = companyName;
    } else if (contactName) {
      campaignName = contactName;
    }

    this.campaignForm.patchValue({
      name: campaignName,
    });

    this.campaignForm.get('name')?.updateValueAndValidity(); // Ensures validation updates
  }

  onTagAdd(value: string) {
    if (!this.tags.includes(value)) {
      this.tags.push(value);
    }
  }

  onTagDelete(value: string) {
    this.tags = this.tags.filter((tag: string) => tag !== value);
  }

  submitTags() {
    this.campaignService.updateTags(this.campaign.id, this.tags).subscribe(() => {
      this.router.navigate(['campaigns', 'edit', this.campaign.id, 'order-confirmation']);
    });
  }

  subscribeToFormChanges(): void {
    this.formSubscription = combineLatest([
      this.campaignForm.get('start_date').valueChanges,
      this.campaignForm.get('end_date').valueChanges,
      this.campaignForm.get('start_time').valueChanges,
      this.campaignForm.get('end_time').valueChanges,
    ])
      .pipe(
        debounceTime(300), // Prevents too many calls
        filter(([startDate, endDate, startTime, endTime]) => startDate && endDate && startTime && endTime), // Ensure all values are present
      )
      .subscribe(() => {
        this.calculateEstimatedAmount();
      });
  }

  calculateEstimatedAmount() {
    const startDate = this.campaignForm.get('start_date').value;
    const endDate = this.campaignForm.get('end_date').value;
    const startTime = this.campaignForm.get('start_time').value;
    const endTime = this.campaignForm.get('end_time').value;
    if (!startDate || !endDate || !startTime || !endTime) {
      return;
    }
    this.campaignService.calculateBudget(this.campaign.id, startDate, endDate, startTime, endTime).subscribe((data) => {
      this.campaignForm.patchValue({
        budget: data,
      });
    });
  }

  private gtmDataLayerPushEvent(eventName: string, eventData: Record<string, string | number> = {}): void {
    this.gtm.dataLayerPushEvent(eventName, eventData);
  }
}
