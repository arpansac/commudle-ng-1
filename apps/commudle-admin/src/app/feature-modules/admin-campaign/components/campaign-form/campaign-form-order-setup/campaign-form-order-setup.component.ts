import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { faPlus, faXmark, faArrowRight, faFileImage } from '@fortawesome/free-solid-svg-icons';
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
  constructor(private activatedRoute: ActivatedRoute, private _fb: FormBuilder) {
    this.campaignForm = this._fb.group({
      name: ['', Validators.required],
      email_address: ['', [Validators.required, Validators.email]],
      company_name: ['', Validators.required],
      campaign_name: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      budget: [0, Validators.required],
      campaign_assets: this._fb.array([this.createCampaignAsset()]),
    });
  }

  createCampaignAsset(): FormGroup {
    return this._fb.group({
      image: [null, Validators.required],
      headline: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)[\w.-]+(\.[a-zA-Z]{2,})+([/?#].*)?$/)]],
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
    this.activatedRoute.fragment.subscribe((fragment) => {
      this.fragment = fragment || '';
      console.log(this.fragment);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFileChange(event: any, index: number) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.campaignAssets.at(index).patchValue({ image: file });
    }
  }

  handleInput(value: string | number, key: string) {
    this.campaignForm.patchValue({ [key]: value });
    console.log(this.campaignForm.value);
  }

  handleArrayFormInput(value: string | number, key: string, index: number, formArrayName: string) {
    const formArray = this.campaignForm.get(formArrayName) as FormArray;

    if (formArray && formArray.controls[index]) {
      formArray.at(index).patchValue({ [key]: value });
      console.log(this.campaignForm.value); // Debugging output
    } else {
      console.error(`Invalid index ${index} for form array ${formArrayName}`);
    }
  }
  updateCampaign() {
    console.log(this.campaignForm.value);
  }
}
