import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICampaign, ICampaignAsset, ECampaignTypeSlug, IAttachedFile } from '@commudle/shared-models';
import { CampaignService, GoogleTagManagerService, SeoService, ToastrService } from '@commudle/shared-services';
import {
  faPlus,
  faXmark,
  faArrowRight,
  faFileImage,
  faRectangleAd,
  faUsers,
  faMapMarkerAlt,
  faTag,
  faEnvelope,
  faChevronDown,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
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
    faRectangleAd,
    faUsers,
    faMapMarkerAlt,
    faTag,
    faEnvelope,
    faChevronDown,
    faImage,
  };
  campaign: ICampaign;
  imagePreview = [];
  tags = [];
  estimatedRuntime = '3 days 24 minutes';
  dailySpending = 600;

  formSubscription: Subscription;
  gstInvoiceSubscription: Subscription;
  ECampaignTypeSlug = ECampaignTypeSlug;
  uploadedImagesFiles: IAttachedFile[] = [];
  uploadedImages = [];
  Form1Invalid = true;

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
        start_at: ['', Validators.required],
        end_at: [''],
        set_end_date: [false],
        budget: [0, [Validators.required, Validators.min(50)]],
        locations: ['', Validators.required],
        communities: [''],
        tags: [''],
        campaign_assets: this._fb.array([this.createCampaignAsset()]),
        // id: [13],
        // status: null,
        // created_at: [''],
        // user: this._fb.group({
        //   name: [''],
        //   username: [''],
        // }),
        // currency_type: [''],
        // unapproved_reasons: this._fb.array([]),

        // contact_name: ['', Validators.required],
        // contact_email: ['', [Validators.required, Validators.email]],
        // company_name: ['', Validators.required],
        // gst_invoice: [false],
        // gst_number: [''],
        // billing_address: [''],
        // billing_address_line2: [''],
        // state: [''],
        // email_reminder: [false],
      },
      {
        validators: [this.endDateValidator],
      },
    );
  }

  ngOnInit() {
    if (this.router.url.includes('/edit/')) {
      this.activatedRoute.parent?.data.subscribe((data) => {
        console.log(data, 'data');
        if (data['campaign']) {
          console.log(data['campaign'], 'data');
          this.campaign = data['campaign'];
          this.patchCampaignForm();
          setTimeout(() => {
            if (this.campaignForm.get('set_end_date')?.value) {
              this.onSetEndDateChange();
            }
            if (!this.isForm1Invalid()) {
              this.Form1Invalid = false;
            }
          });
          this.seoService.setTags(
            `Edit ${this.campaign.name} Campaign`,
            `Edit your campaign ${this.campaign.name}`,
            'https://commudle.com/assets/images/commudle-logo192.png',
          );
        }
      });
    } else {
      this.seoService.setTags(
        'Create a Campaign',
        'Create a new campaign to boost outreach to thousands of developers on Commudle. Choose a campaign type to start',
        'https://commudle.com/assets/images/commudle-logo192.png',
      );
    }
    // this.checkFragment();
    // this.subscribeToFormChanges();
    // this.subscribeToGstInvoiceChanges();
  }

  ngOnDestroy(): void {
    // if (this.formSubscription) {
    //   this.formSubscription.unsubscribe();
    // }
    // if (this.gstInvoiceSubscription) {
    //   this.gstInvoiceSubscription.unsubscribe();
    // }
  }

  createCampaign() {
    console.log(this.campaignForm.value, 'campaignForm');
    // if (!this.campaignForm.valid) {
    //   this.campaignForm.markAllAsTouched();
    //   return;
    // }

    // const formData = new FormData();
    // const formValue = this.campaignForm.value;

    // Append form fields to FormData
    // formData.append('campaign[name]', formValue.name || '');
    // formData.append('campaign[start_at]', formValue.start_at || '');
    // formData.append('campaign[end_at]', formValue.end_at || '');
    // formData.append('campaign[budget]', formValue.budget || 0);
    // formData.append('campaign[locations]', formValue.locations || '');
    // formData.append('campaign[communities]', formValue.communities || '');
    // formData.append('campaign[tags]', formValue.tags || '');

    // if (formValue.campaign_assets && formValue.campaign_assets.length > 0) {
    // formValue.campaign_assets.forEach((asset, index) => {
    //   formData.append(`campaign[campaign_assets[${index}][headline]]`, asset.headline || '');
    //   formData.append(`campaign[campaign_assets[${index}][url]]`, asset.url || '');

    //   // Handle image: can be a File (new upload) or a string/url (existing)
    //   if (asset.image instanceof File) {
    //     formData.append(`campaign[campaign_assets[${index}][image]]`, asset.image);
    //   } else if (asset.image) {
    //     // If it's a string/url, append it as a string value
    //     formData.append(`campaign[campaign_assets[${index}][image]]`, asset.image);
    //   }
    // });
    // }

    // Append uploaded images if any (from the separate image upload section)
    // if (this.uploadedImagesFiles && this.uploadedImagesFiles.length > 0) {
    //   this.uploadedImagesFiles.forEach((imgFile, index) => {
    //     if (imgFile.file && !(imgFile as any).delete) {
    //       formData.append(`campaign[images][${index}]`, imgFile.file);
    //     }
    //   });
    // }

    const campaignData: any = {
      campaign: {
        name: this.campaignForm.value.name,
        start_at: this.campaignForm.value.start_at || null,
      },
    };

    if (this.campaignForm.get('set_end_date')?.value) {
      campaignData.campaign.end_at = this.campaignForm.value.end_at || null;
    }

    this.campaignService.createCampaign(campaignData).subscribe((res: ICampaign) => {
      if (res) {
        console.log(res, 'res');
        this.campaign = res; // Store the created campaign
        this.router.navigate(['campaigns', 'edit', res.id], { replaceUrl: true });
        this.gtmDataLayerPushEvent('new-campaign-step-1-created', {
          com_campaign_id: res.id,
          // com_campaign_type_name: res.campaign_type?.name,
        });
      }
    });
  }

  endDateValidator(formGroup: AbstractControl): ValidationErrors | null {
    const startDate = formGroup.get('start_at')?.value;
    const endDate = formGroup.get('end_at')?.value;

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

  patchCampaignForm() {
    if (this.campaign.name) {
      this.campaignForm.patchValue({
        name: this.campaign.name,
        start_at: this.formatDateTimeForInput(this.campaign.start_at),
        end_at: this.formatDateTimeForInput(this.campaign.end_at),
        set_end_date: !!this.campaign.end_at,
        // contact_name: this.campaign.contact_name,
        // contact_email: this.campaign.contact_email,
        // company_name: this.campaign.company_name,
        // gst_invoice: (this.campaign as any).gst_invoice || false,
        // gst_number: (this.campaign as any).gst_number || '',
        // billing_address: (this.campaign as any).billing_address || '',
        // billing_address_line2: (this.campaign as any).billing_address_line2 || '',
        // state: (this.campaign as any).state || '',
        // set_end_date: !!this.campaign.end_date, // Set to true if end_date exists
        // start_time: this.convertUtcTimeToLocalString(this.campaign.start_time.toString()),
        // end_time: this.convertUtcTimeToLocalString(this.campaign.end_time.toString()),
        // start_date: this.campaign.start_date,
        // end_date: this.campaign.end_date,
        // budget: this.campaign.budget,
        // total_budget: (this.campaign as any).total_budget || 500,
        // location: (this.campaign as any).location || '',
        // communities: (this.campaign as any).communities || '',
        // skills: (this.campaign as any).skills || '',
        // email_reminder: (this.campaign as any).email_reminder || false,
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

    // if (this.campaign.campaign_type.slug === ECampaignTypeSlug.MAIN_NEWSLETTER) {
    //   this.campaignService.calculateBudget(this.campaign.id).subscribe((data) => {
    //     this.campaignForm.patchValue({ budget: data });
    //   });
    // }
  }

  private formatDateTimeForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const isoString = date.toISOString();
    return isoString.substring(0, 16);
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
    // img.onload = () => {
    //   if (
    //     img.width !== this.campaign.campaign_type.image_dimension?.width ||
    //     img.height !== this.campaign.campaign_type.image_dimension?.height
    //   ) {
    //     this.toasterService.warningDialog(
    //       'Image must be exactly ' +
    //         this.campaign.campaign_type.image_dimension.width +
    //         ' X ' +
    //         this.campaign.campaign_type.image_dimension.height +
    //         ' pixels.',
    //     );
    //     event.target.value = ''; // Reset input field
    //     return;
    //   }

    //   // Ensure `campaignAssets` is correctly accessed as FormArray
    //   const campaignAssets = this.campaignForm.get('campaign_assets') as FormArray;
    //   if (campaignAssets && campaignAssets.at(index)) {
    //     campaignAssets.at(index).patchValue({ image: file });
    //     campaignAssets.at(index).get('image')?.updateValueAndValidity();

    //     // Display image preview
    //     this.previewImage(file, index);
    //   }
    // };

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
    formData.append('campaign[gst_invoice]', formValue.gst_invoice);

    // Append GST fields if GST invoice is required
    if (formValue.gst_invoice) {
      formData.append('campaign[gst_number]', formValue.gst_number || '');
      formData.append('campaign[billing_address]', formValue.billing_address || '');
      formData.append('campaign[billing_address_line2]', formValue.billing_address_line2 || '');
      formData.append('campaign[state]', formValue.state || '');
      formData.append('campaign[contact_email]', formValue.contact_email || '');
    }

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
    formData.append('campaign[total_budget]', formValue.total_budget || '');
    formData.append('campaign[location]', formValue.location || '');
    formData.append('campaign[communities]', formValue.communities || '');
    formData.append('campaign[skills]', formValue.skills || '');
    formData.append('campaign[email_reminder]', formValue.email_reminder || false);

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
          // com_campaign_type_name: this.campaign.campaign_type.name,
        });
        this.submitTags();
      }
    });
  }

  // checkFragment() {
  //   this.activatedRoute.fragment.subscribe((fragment) => {
  //     if (fragment) {
  //       requestAnimationFrame(() => {
  //         const element = document.getElementById(fragment);
  //         if (element) {
  //           element.scrollIntoView({
  //             behavior: 'smooth',
  //             block: 'start',
  //             inline: 'nearest',
  //           });
  //         }
  //       });
  //     }
  //   });
  // }

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

  subscribeToGstInvoiceChanges(): void {
    this.gstInvoiceSubscription = this.campaignForm.get('gst_invoice').valueChanges.subscribe((value: boolean) => {
      const gstNumberControl = this.campaignForm.get('gst_number');
      const billingAddressControl = this.campaignForm.get('billing_address');
      const stateControl = this.campaignForm.get('state');

      if (value) {
        // Add required validators when GST invoice is checked
        gstNumberControl?.setValidators([Validators.required]);
        billingAddressControl?.setValidators([Validators.required]);
        stateControl?.setValidators([Validators.required]);
      } else {
        // Remove validators and clear values when unchecked
        gstNumberControl?.clearValidators();
        gstNumberControl?.setValue('');
        billingAddressControl?.clearValidators();
        billingAddressControl?.setValue('');
        stateControl?.clearValidators();
        stateControl?.setValue('');
      }

      gstNumberControl?.updateValueAndValidity({ emitEvent: false });
      billingAddressControl?.updateValueAndValidity({ emitEvent: false });
      stateControl?.updateValueAndValidity({ emitEvent: false });
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

  onSetEndDateChange() {
    const setEndDate = this.campaignForm.get('set_end_date')?.value;
    const endDateControl = this.campaignForm.get('end_at');

    if (endDateControl) {
      if (setEndDate) {
        endDateControl.setValidators([Validators.required]);
      } else {
        endDateControl.clearValidators();
        endDateControl.setValue('');
      }
      endDateControl.updateValueAndValidity();
    }
  }

  addImages(event) {
    if (event.target.files && event.target.files.length > 0) {
      for (const file of event.target.files) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        const maxSize = 3 * 1024 * 1024; // 3 MB in bytes
        if (file.size > maxSize) {
          this.toasterService.warningDialog('Image should be less than 3 Mb', 3000);
          return;
        }
        if (!allowedTypes.includes(file.type)) {
          this.toasterService.warningDialog('Please upload a valid image file (PNG, JPG, JPEG)');
          return;
        }
        const imgFile: IAttachedFile = {
          id: null,
          file: file,
          url: null,
          name: null,
          type: null,
        };
        this.uploadedImagesFiles.push(imgFile);
        const reader = new FileReader();
        reader.onload = () => this.uploadedImages.push(reader.result);
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index) {
    if (this.uploadedImagesFiles[index]['id']) {
      this.uploadedImagesFiles[index]['delete'] = true;
    } else {
      this.uploadedImagesFiles.splice(index, 1);
      this.uploadedImages.splice(index, 1);
    }
  }

  isForm1Invalid(): boolean {
    const nameControl = this.campaignForm.get('name');
    const startAtControl = this.campaignForm.get('start_at');
    const setEndDate = this.campaignForm.get('set_end_date')?.value;
    const endAtControl = this.campaignForm.get('end_at');

    if (nameControl?.invalid || startAtControl?.invalid) {
      nameControl.markAsTouched();
      startAtControl.markAsTouched();
      return true;
    }

    if (setEndDate && (endAtControl?.invalid || this.campaignForm.hasError('endDateValidator'))) {
      endAtControl.markAsTouched();
      return true;
    }

    return false;
  }

  onAccordion2Click(event: MouseEvent) {
    console.log('onAccordion2Click');
    if (this.isForm1Invalid()) {
      console.log('Form1Invalid is true');
      this.Form1Invalid = true;
      return;
    } else {
      console.log('Form1Invalid is false');
      event.preventDefault();
      event.stopPropagation();
      this.Form1Invalid = false;
      this.createCampaign();
    }
  }
}
