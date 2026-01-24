import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
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
import { ICampaign, ICampaignAsset, ECampaignTypeSlug, IAttachedFile, EDbModels } from '@commudle/shared-models';
import { CampaignService, GoogleTagManagerService, SeoService, ToastrService } from '@commudle/shared-services';
import { GooglePlacesAutocompleteService } from 'apps/commudle-admin/src/app/services/google-places-autocomplete.service';
import { SearchService } from 'apps/commudle-admin/src/app/feature-modules/search/services/search.service';
import { ISearch } from 'apps/shared-models/search.model';
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
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { combineLatest, debounceTime, distinctUntilChanged, filter, Subscription, switchMap } from 'rxjs';

@Component({
    selector: 'commudle-campaign-form-order-setup',
    templateUrl: './campaign-form-order-setup.component.html',
    styleUrls: ['./campaign-form-order-setup.component.scss'],
    standalone: false
})
export class CampaignFormOrderSetupComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('addressInputElement', { read: ElementRef }) addressInputElement: ElementRef;
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
    faTrash,
  };
  campaign: ICampaign;
  estimatedRuntime = '3 days 24 minutes';
  dailySpending = 600;

  ECampaignTypeSlug = ECampaignTypeSlug;
  // uploadedImagesFiles: IAttachedFile[] = [];
  // uploadedImages = [];
  Form1Invalid = true;
  campaignCreated = false;
  savedAssets = [];
  // : Array<{ image: string; headline: string; url: string; file: File | string; index: number }>

  communitiesFormControl = new FormControl('');
  communitiesSearchResult = [];
  selectedCommunities: Array<{ id: number; name: string; slug: string }> = [];
  EDbModels = EDbModels;
  page = 1;
  count = 10;
  imagePreview = [];
  assetSavedStatus: boolean[] = [false];

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
      this.campaignCreated = true;
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

  ngOnDestroy(): void {}

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
        this.campaignCreated = true;
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

  // addCampaignAsset() {
  //   if((this.campaignForm.get('campaign_assets') as FormArray).invalid) {
  //     (this.campaignForm.get('campaign_assets') as FormArray).markAllAsTouched();
  //     return;
  //   }
  //   this.assetSavedStatus[index] = true;
  //   this.campaignAssets.push(this.createCampaignAsset());
  //   this.assetSavedStatus.push(false);
  // }

  // 1. Update addCampaignAsset to move data to savedAssets array
  addCampaignAsset(event: Event, index: number) {
    console.log(index, 'called');
    console.log(event, 'event');
    const formArray = this.campaignAssets;
    const currentAssetForm = formArray.at(index) as FormGroup; // We only use index 0 for the active form

    if (currentAssetForm.invalid) {
      currentAssetForm.markAllAsTouched();
      return;
    }
    // Push current form values to the savedAssets array
    const assetData = currentAssetForm.value;
    console.log(assetData, 'assetData');
    this.savedAssets.push({
      id: assetData.id || null,
      image: assetData.image, // The Base64 preview string
      headline: assetData.headline,
      url: assetData.url,
      // file: ,          // The actual File object for API
    });
    console.log(this.savedAssets, 'savedAssets');

    // Reset the form and the single preview slot for the next entry
    currentAssetForm.reset();
    this.imagePreview[index] = null;

    this.cdr.detectChanges();
  }

  // 2. Remove from saved list
  removeSavedAsset(index: number) {
    this.savedAssets.splice(index, 1);
  }

  removeCampaignAsset(index: number) {
    this.campaignAssets.removeAt(index);
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

      if (this.campaign.campaign_assets && this.campaign.campaign_assets.length > 0) {
        this.savedAssets = [];

        this.campaign.campaign_assets.forEach((asset) => {
          console.log(asset, 'asset');
          this.savedAssets.push({
            id: asset.id || null,
            image: asset.image?.url, // Existing URL from server
            headline: asset.headline,
            url: asset.url,
            // file: asset.image?.url, // Keep string URL if not changed
          });
        });

        const campaignAssetsFormArray = this.campaignForm.get('campaign_assets') as FormArray;
        campaignAssetsFormArray.clear();
        campaignAssetsFormArray.push(this.createCampaignAsset());
        this.imagePreview = [null];

        // this.campaign.campaign_assets.forEach((asset, index) => {
        //   campaignAssetsFormArray.push(this.createCampaignAsset(asset));
        //   if (asset.image && asset.image.url) {
        //     this.imagePreview[index] = asset.image.url;
        //   }
        // });
      }
    }
  }

  private formatDateTimeForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const isoString = date.toISOString();
    return isoString.substring(0, 16);
  }

  onFileChange(event: any, index: number) {
    console.log(index);
    console.log(event);
    const file = (event.target as HTMLInputElement).files?.[0];
    console.log(file);
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
    console.log(img);
    console.log(img.src);
    img.onload = () => {
      console.log(img.width);
      console.log(img.height);

      const campaignAssets = this.campaignForm.get('campaign_assets') as FormArray;
      console.log(campaignAssets);
      console.log(campaignAssets.at(index));
      if (campaignAssets && campaignAssets.at(index)) {
        campaignAssets.at(index).get('image').setValue(file);
        console.log(campaignAssets.at(index).get('image'), 'arshdeep');
        console.log(campaignAssets.at(index), 'arshdeep 1');
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
    console.log(i);
    console.log(file);
    const reader = new FileReader();
    reader.onload = () => {
      console.log(reader.result);
      this.imagePreview[i] = reader.result as string;
      console.log(this.imagePreview[i]);
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
    const formData = new FormData();
    const formValue = this.campaignForm.value;

    // Append non-file fields to FormData
    formData.append('campaign[name]', formValue.name);
    formData.append('campaign[budget]', formValue.budget.toString());
    formData.append('campaign[start_at]', formValue.start_at);
    if (formValue.end_at) {
      formData.append('campaign[end_at]', formValue.end_at);
    }

    const locations = formValue.locations ? formValue.locations.split(',').map((l) => l.trim()) : [];
    locations.forEach((loc) => formData.append('campaign[locations][]', loc));

    const communitySlugs = this.selectedCommunities.map((c) => c.slug);
    communitySlugs.forEach((slug) => formData.append('campaign[communities][]', slug));

    this.savedAssets.forEach((asset, index) => {
      formData.append(`campaign[campaign_assets][${index}][headline]`, asset.headline);
      formData.append(`campaign[campaign_assets][${index}][url]`, asset.url);

      if (asset.id) {
        formData.append(`campaign[campaign_assets][${index}][id]`, asset.id.toString());
      }

      console.log(asset, 'asset arshdeep');
      if (asset.image instanceof File) {
        console.log(asset.image, 'asset file arshdeep');
        formData.append(`campaign[campaign_assets][${index}][image]`, asset.image);
      }
    });

    this.campaignService.updateCampaign(formData, this.campaign.id).subscribe((data) => {
      if (data) {
        //Call Submit Api Here
        // this.gtmDataLayerPushEvent('new-campaign-step-2-created', {
        //   com_campaign_id: this.campaign.id,
        // });
      }
    });
  }

  updateCampaign12() {
    const communitiesArray = this.selectedCommunities.map((c) => c.slug);

    const campaignData: any = {
      campaign: {
        name: this.campaignForm.value.name,
        budget: this.campaignForm.value.budget,
        locations: this.campaignForm.value.locations ? this.campaignForm.value.locations.split(', ') : [],
        communities: communitiesArray,
        start_at: this.campaignForm.value.start_at,
        end_at: this.campaignForm.value.end_at,
      },
    };
    this.campaignService.updateCampaign(campaignData, this.campaign.id).subscribe((res) => {});
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

    if (this.campaignCreated) {
      return;
    }

    if (this.isForm1Invalid()) {
      this.Form1Invalid = true;
      return;
    } else {
      event.preventDefault();
      event.stopPropagation();
      this.Form1Invalid = false;
      this.campaignCreated = true;
      this.createCampaign();
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
