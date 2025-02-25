import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICampaign, ICampaignAsset, ECampaignStatus } from '@commudle/shared-models';
import { CampaignService, ToastrService } from '@commudle/shared-services';
import { faPlus, faXmark, faArrowRight, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'commudle-campaign-form-order-setup',
  templateUrl: './campaign-form-order-setup.component.html',
  styleUrls: ['./campaign-form-order-setup.component.scss'],
})
export class CampaignFormOrderSetupComponent implements OnInit {
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
  constructor(
    private activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private campaignService: CampaignService,
    private datePipe: DatePipe,
    private toasterService: ToastrService,
    private router: Router,
  ) {
    this.campaignForm = this._fb.group(
      {
        name: ['', Validators.required], //campaign name
        contact_name: ['', Validators.required],
        contact_email: ['', [Validators.required, Validators.email]],
        company_name: ['', Validators.required],
        start_time: ['', Validators.required],
        end_time: ['', Validators.required],
        budget: [0, Validators.required],
        campaign_assets: this._fb.array([this.createCampaignAsset()]),
      },
      {
        validator: this.endTimeValidator, // Add the custom validator
      },
    );
  }

  endTimeValidator(formGroup: AbstractControl) {
    const startTime = formGroup.get('start_time')?.value;
    const endTime = formGroup.get('end_time')?.value;

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end <= start) {
        return { endTimeInvalid: true }; // Custom validation error
      }
    }

    return null;
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
    this.activatedRoute.parent.data.subscribe((data) => {
      this.campaign = data['campaign'];
      if (this.campaign.name) {
        this.campaignForm.patchValue({
          name: this.campaign.name,
          contact_name: this.campaign.contact_name,
          contact_email: this.campaign.contact_email,
          company_name: this.campaign.company_name,
          start_time: this.datePipe.transform(this.campaign.start_time, 'yyyy-MM-ddTHH:mm:ss'),
          end_time: this.datePipe.transform(this.campaign.end_time, 'yyyy-MM-ddTHH:mm:ss'),
          budget: this.campaign.budget,
        });

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
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      event.target = '';
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
    } else {
      console.error(`Invalid index ${index} for form array ${formArrayName}`);
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
    formData.append('campaign[start_time]', this.convertDateToLocal(formValue.start_time));
    formData.append('campaign[end_time]', this.convertDateToLocal(formValue.end_time));
    formData.append('campaign[budget]', formValue.budget);
    formData.append('campaign[status]', ECampaignStatus.DRAFT);

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
        this.router.navigate(['campaigns', 'edit', data.id, 'order-confirmation']);
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

  convertDateToLocal(date) {
    return new Date(date).toISOString();
  }

  generateCampaignName() {
    const campaignName =
      this.campaignForm.get('company_name').value + '-' + this.campaignForm.get('contact_name').value;
    this.campaignForm.patchValue({
      name: campaignName,
    });
  }
}
