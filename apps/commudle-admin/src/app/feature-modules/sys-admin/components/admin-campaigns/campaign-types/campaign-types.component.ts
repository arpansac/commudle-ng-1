import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICampaignType } from '@commudle/shared-models';
import { ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { SysAdminCampaignService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-campaign.service';
@Component({
  selector: 'commudle-campaign-types',
  templateUrl: './campaign-types.component.html',
  styleUrls: ['./campaign-types.component.scss'],
})
export class CampaignTypesComponent implements OnInit {
  campaignTypeForm: FormGroup;
  campaignTypes: ICampaignType[];
  icons = {
    faEdit,
    faTrash,
  };
  isLoading = true;

  constructor(
    private dialogService: NbDialogService,
    private fb: FormBuilder,
    private sysAdminCampaignTypesService: SysAdminCampaignService,
    private toasterService: ToastrService,
  ) {
    this.campaignTypeForm = this.fb.group({
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: ['', Validators.required],
      active: [true],
      budget_amount: ['', Validators.required],
      image_dimension: this.fb.group({
        height: [NaN, Validators.required],
        width: [NaN, Validators.required],
      }),
    });
  }

  ngOnInit() {
    this.getCampaignTypes();
  }

  getCampaignTypes() {
    this.sysAdminCampaignTypesService.getCampaignTypes().subscribe((res: ICampaignType[]) => {
      this.campaignTypes = res;
      this.isLoading = false;
    });
  }

  openDialog(dialog, campaignType?: ICampaignType) {
    if (campaignType) {
      this.campaignTypeForm.patchValue({
        name: campaignType.name,
        description: campaignType.description,
        active: campaignType.active,
        budget_amount: campaignType.budget_amount,
        slug: campaignType.slug,
        image_dimension: {
          height: campaignType?.image_dimension?.height,
          width: campaignType?.image_dimension?.width,
        },
      });
    } else {
      this.campaignTypeForm.reset();
      this.campaignTypeForm.patchValue({
        active: true,
      });
    }
    this.dialogService.open(dialog, { context: { campaignType: campaignType } });
  }

  create() {
    this.sysAdminCampaignTypesService.createCampaignType(this.campaignTypeForm.value).subscribe((res) => {
      if (res) {
        this.campaignTypes.push(res);
      }
    });
  }

  update(campaignTypeId: number) {
    this.sysAdminCampaignTypesService
      .updateCampaignType(this.campaignTypeForm.value, campaignTypeId)
      .subscribe((res) => {
        if (res) {
          const campaignTypeIndex = this.campaignTypes.findIndex((c) => c.id === campaignTypeId);
          this.campaignTypes[campaignTypeIndex] = res;
        }
      });
  }

  toggleCampaignStatus(campaignTypeId: number) {
    this.sysAdminCampaignTypesService.toggleCampaignStatus(campaignTypeId).subscribe((res) => {
      if (res) {
        const campaignTypeIndex = this.campaignTypes.findIndex((c) => c.id === campaignTypeId);
        this.campaignTypes[campaignTypeIndex].active = !this.campaignTypes[campaignTypeIndex].active;
        this.toasterService.successDialog('Campaign status updated successfully');
      }
    });
  }

  generateSlug() {
    const slug = this.campaignTypeForm
      .get('name')
      .value.trim() // Remove leading & trailing spaces
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '_'); // Replace spaces with hyphens
    this.campaignTypeForm.patchValue({
      slug: slug,
    });
  }
}
