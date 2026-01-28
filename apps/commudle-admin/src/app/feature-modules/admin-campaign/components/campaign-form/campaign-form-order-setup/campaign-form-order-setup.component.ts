import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ICampaign, ICampaignAsset, EDbModels } from '@commudle/shared-models';
import { CampaignService, GoogleTagManagerService, SeoService, ToastrService } from '@commudle/shared-services';
import { GooglePlacesAutocompleteService } from 'apps/commudle-admin/src/app/services/google-places-autocomplete.service';
import { SearchService } from 'apps/commudle-admin/src/app/feature-modules/search/services/search.service';
import { ISearch } from 'apps/shared-models/search.model';
import { faArrowRight, faFileImage, faRectangleAd, faTrash } from '@fortawesome/free-solid-svg-icons';
import { distinctUntilChanged, switchMap } from 'rxjs';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { environment } from '@commudle/shared-environments';

@Component({
    selector: 'commudle-campaign-form-order-setup',
    templateUrl: './campaign-form-order-setup.component.html',
    styleUrls: ['./campaign-form-order-setup.component.scss'],
    standalone: false
})
export class CampaignFormOrderSetupComponent implements OnInit, AfterViewInit {
  @ViewChild('addressInputElement', { read: ElementRef }) addressInputElement: ElementRef;
  campaignForm: FormGroup;
  icons = {
    faArrowRight,
    faFileImage,
    faRectangleAd,
    faTrash,
  };
  campaign: ICampaign;
  estimatedRuntime: string;
  dailySpending: number;
  Form1Invalid = true;
  accordion3Expanded = true;

  communitiesFormControl = new FormControl('');
  communitiesSearchResult = [];
  selectedCommunities: Array<{ id: number; name: string; slug: string }> = [];
  EDbModels = EDbModels;
  page = 1;
  count = 10;
  imagePreview = [];
  staticAssets = staticAssets;
  defaultUrl = environment.app_url + '/campaigns/new';

  constructor(
    private activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private campaignService: CampaignService,
    private toasterService: ToastrService,
    private router: Router,
    private seoService: SeoService,
    private gtm: GoogleTagManagerService,
    private googlePlacesAutocompleteService: GooglePlacesAutocompleteService,
    private searchService: SearchService,
    private cdr: ChangeDetectorRef,
  ) {
    this.campaignForm = this._fb.group(
      {
        name: ['', [Validators.required, Validators.pattern(/^\S*$/)]], //campaign name
        start_at: ['', Validators.required],
        end_at: [''],
        set_end_date: [false],
        budget: [0, [Validators.required, Validators.min(50)]],
        locations: ['', Validators.required],
        communities: [],
        campaign_assets: this._fb.array([this.createCampaignAsset()]),
      },
      {
        validators: [this.endDateValidator],
      },
    );
  }

  ngOnInit() {
    if (this.router.url.includes('/edit/')) {
      this.activatedRoute.parent?.data.subscribe((data) => {
        if (data['campaign']) {
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
  }

  ngAfterViewInit() {
    this.initAutocomplete();
    this.observeCommunitiesInput();
  }

  createCampaign() {
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
        this.campaign = res; // Store the created campaign
        this.router.navigate(['campaigns', 'edit', res.id], { replaceUrl: true });
        // this.gtmDataLayerPushEvent('new-campaign-step-1-created', {
        //   com_campaign_id: res.id,
        //   com_campaign_type_name: this.campaign.campaign_type.name,
        // });
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

  addAsset(index: number) {
    const currentGroup = this.campaignAssets.at(index) as FormGroup;

    // Validate the current asset before saving
    if (currentGroup.invalid) {
      currentGroup.markAllAsTouched();
      return;
    }

    // Prepare FormData for the single asset
    const formData = new FormData();
    const assetData = currentGroup.value;

    formData.append('campaign[campaign_assets][0][headline]', assetData.headline);
    formData.append('campaign[campaign_assets][0][url]', assetData.url);

    if (assetData.id) {
      formData.append('campaign[campaign_assets][0][id]', assetData.id.toString());
    }

    if (assetData.image instanceof File) {
      formData.append('campaign[campaign_assets][0][image]', assetData.image);
    }

    // Save the asset to API
    this.campaignService.updateCampaign(formData, this.campaign.id).subscribe((updatedCampaign: ICampaign) => {
      // Create a new object reference with a new array reference to ensure change detection
      this.campaign = {
        ...updatedCampaign,
        campaign_assets: updatedCampaign.campaign_assets ? [...updatedCampaign.campaign_assets] : [],
      };
      this.loadCampaignAssetsFromApi();
      this.resetAssetForm();
      this.cdr.detectChanges();
    });
  }

  private loadCampaignAssetsFromApi() {
    const campaignAssetsFormArray = this.campaignForm.get('campaign_assets') as FormArray;
    campaignAssetsFormArray.clear();
    this.imagePreview = [];

    // Add all saved assets from API
    if (this.campaign?.campaign_assets && this.campaign.campaign_assets.length > 0) {
      this.campaign.campaign_assets.forEach((asset) => {
        const assetForm = this.createCampaignAsset(asset);
        campaignAssetsFormArray.push(assetForm);
        // Set image preview if available
        if (asset.image?.url) {
          this.imagePreview.push(asset.image.url);
        } else {
          this.imagePreview.push(null);
        }
      });
    }

    // Always add one empty form for new asset entry
    campaignAssetsFormArray.push(this.createCampaignAsset());
    this.imagePreview.push(null);

    this.cdr.detectChanges();
  }

  private resetAssetForm() {
    const campaignAssetsFormArray = this.campaignForm.get('campaign_assets') as FormArray;
    const lastIndex = campaignAssetsFormArray.length - 1;

    if (lastIndex >= 0) {
      // Reset the last form (the empty one)
      campaignAssetsFormArray.at(lastIndex).reset();
      this.imagePreview[lastIndex] = null;
    } else {
      // If no forms exist, create one
      campaignAssetsFormArray.push(this.createCampaignAsset());
      this.imagePreview.push(null);
    }

    this.cdr.detectChanges();
  }

  removeCampaignAsset(index: number) {
    if (!this.campaign.campaign_assets || index >= this.campaign.campaign_assets.length) {
      return;
    }

    const assetToRemove = this.campaign.campaign_assets[index];
    const assetId = assetToRemove.id;

    if (!assetId) {
      return;
    }

    // Remove from API by updating campaign without this asset
    const formData = new FormData();
    const remainingAssets = this.campaign.campaign_assets.filter((asset) => {
      return asset.id !== assetId;
    });

    // Rebuild FormData with all assets except the one being deleted
    remainingAssets.forEach((asset, idx) => {
      formData.append(`campaign[campaign_assets][${idx}][headline]`, asset.headline);
      formData.append(`campaign[campaign_assets][${idx}][url]`, asset.url);
      if (asset.id) {
        formData.append(`campaign[campaign_assets][${idx}][id]`, asset.id.toString());
      }
    });

    this.campaignService.updateCampaign(formData, this.campaign.id).subscribe((updatedCampaign: ICampaign) => {
      // Create a new object reference with a new array reference to ensure change detection
      this.campaign = {
        ...updatedCampaign,
        campaign_assets: updatedCampaign.campaign_assets ? [...updatedCampaign.campaign_assets] : [],
      };
      this.loadCampaignAssetsFromApi();
      this.cdr.detectChanges();
      this.toasterService.successDialog('Asset removed successfully.');
    });
  }

  patchCampaignForm() {
    if (this.campaign.name) {
      const locationValues = this.campaign.locations
        ? this.campaign.locations.map((loc: any) => loc.location || loc).join(', ')
        : '';

      let communitySlugs: string[] = [];
      if (this.campaign.communities && this.campaign.communities.length > 0) {
        this.selectedCommunities = this.campaign.communities.map((community: any) => ({
          id: community.id || community,
          name: community.name || community,
          slug: community.slug || community,
        }));
        communitySlugs = this.selectedCommunities.map((c) => c.slug);
      }

      this.campaignForm.patchValue({
        name: this.campaign.name,
        start_at: this.formatDateTimeForInput(this.campaign.start_at),
        end_at: this.formatDateTimeForInput(this.campaign.end_at),
        set_end_date: !!this.campaign.end_at,
        budget: this.campaign.budget,
        locations: locationValues,
        communities: communitySlugs,
      });

      // Load campaign assets from API
      this.loadCampaignAssetsFromApi();
    }
  }

  private formatDateTimeForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const isoString = date.toISOString();
    return isoString.substring(0, 16);
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
      const campaignAssets = this.campaignForm.get('campaign_assets') as FormArray;
      if (campaignAssets && campaignAssets.at(index)) {
        campaignAssets.at(index).get('image').setValue(file);
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
      this.cdr.detectChanges();
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
    // Validation
    if (!this.campaign?.id) {
      this.toasterService.warningDialog('Campaign ID is missing.');
      return;
    }

    const formData = new FormData();
    const formValue = this.campaignForm.value;

    // Append basic campaign info with null checks
    if (formValue.name) formData.append('campaign[name]', formValue.name);
    if (formValue.budget) formData.append('campaign[budget]', formValue.budget.toString());
    if (formValue.start_at) formData.append('campaign[start_at]', formValue.start_at);
    if (formValue.end_at) formData.append('campaign[end_at]', formValue.end_at);

    // Append locations and communities
    const locations = formValue.locations
      ? formValue.locations
          .split(',')
          .map((l) => l.trim())
          .filter((l) => l)
      : [];
    locations.forEach((loc) => formData.append('campaign[locations][]', loc));

    const communitySlugs = this.selectedCommunities.map((c) => c.slug);
    communitySlugs.forEach((slug) => formData.append('campaign[communities][]', slug));

    // Send saved assets from API
    if (this.campaign?.campaign_assets) {
      this.campaign.campaign_assets.forEach((asset, index) => {
        if (asset.headline && asset.url) {
          formData.append(`campaign[campaign_assets][${index}][headline]`, asset.headline);
          formData.append(`campaign[campaign_assets][${index}][url]`, asset.url);
          if (asset.id) {
            formData.append(`campaign[campaign_assets][${index}][id]`, asset.id.toString());
          }
        }
      });
    }

    this.campaignService.updateCampaign(formData, this.campaign.id).subscribe({
      next: (data) => {
        if (data) {
          this.campaign = { ...data, campaign_assets: data.campaign_assets ? [...data.campaign_assets] : [] };
          this.loadCampaignAssetsFromApi();
          this.cdr.detectChanges();
          this.toasterService.successDialog('Campaign updated successfully');
        }
      },
      error: (error) => {
        this.toasterService.errorDialog('Failed to update campaign. Please try again.');
        console.error('Error updating campaign:', error);
      },
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
    if (this.router.url.includes('/edit/')) {
      return;
    }

    if (this.isForm1Invalid()) {
      this.Form1Invalid = true;
      return;
    } else {
      event.preventDefault();
      event.stopPropagation();
      this.Form1Invalid = false;
      this.createCampaign();
    }
  }

  isForm2Invalid(): boolean {
    const budgetControl = this.campaignForm.get('budget');
    const locationsControl = this.campaignForm.get('locations');

    if (budgetControl?.invalid || locationsControl?.invalid) {
      budgetControl?.markAsTouched();
      locationsControl?.markAsTouched();
      return true;
    }

    return false;
  }

  onAccordion3Click(event: MouseEvent) {
    // Prevent default accordion toggle behavior and event bubbling
    event.preventDefault();
    event.stopPropagation();

    // Ensure accordion stays open
    this.accordion3Expanded = true;

    if (!this.campaign?.id) {
      return;
    }

    const isAccordion1Valid = !this.isForm1Invalid();
    const isAccordion2Valid = !this.isForm2Invalid();

    if (isAccordion1Valid || isAccordion2Valid) {
      this.updateCampaign();
    }
  }

  initAutocomplete() {
    const inputElement = this.addressInputElement.nativeElement.querySelector('input');
    if (inputElement) {
      this.googlePlacesAutocompleteService.initAutocomplete(inputElement, 'establishment');
      this.googlePlacesAutocompleteService.placeChanged.subscribe((place: google.maps.places.PlaceResult) => {
        this.onLocationPlaceSelected(place);
      });
    }
  }

  onLocationPlaceSelected(place: google.maps.places.PlaceResult) {
    this.campaignForm.get('locations').setValue(place.formatted_address);
  }

  observeCommunitiesInput() {
    this.communitiesFormControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        switchMap((value: string) =>
          this.searchService.getSearchResultsByScope(value || '', this.page, this.count, EDbModels.KOMMUNITY),
        ),
      )
      .subscribe((value: ISearch) => {
        this.communitiesSearchResult = value.results;
      });
  }

  onCommunitySelected(communityId: number, communityName: string, communitySlug: string) {
    const isAlreadySelected = this.selectedCommunities.some(
      (community) => community.id === communityId || community.slug === communitySlug,
    );

    if (!isAlreadySelected) {
      this.selectedCommunities.push({
        id: communityId,
        name: communityName,
        slug: communitySlug,
      });

      const communitySlugs = this.selectedCommunities.map((c) => c.slug);
      this.campaignForm.get('communities').setValue(communitySlugs);

      this.communitiesFormControl.setValue('', { emitEvent: false });
    }
  }

  removeCommunity(index: number) {
    this.selectedCommunities.splice(index, 1);
    const communitySlugs = this.selectedCommunities.map((c) => c.slug);
    this.campaignForm.get('communities').setValue(communitySlugs);
  }
}
