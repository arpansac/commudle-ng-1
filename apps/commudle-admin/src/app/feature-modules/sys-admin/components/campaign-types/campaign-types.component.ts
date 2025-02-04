import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ICampaignType } from '@commudle/shared-models';
import { ToastrService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { SysAdminCampaignTypesService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-campaign-types.service';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
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
    private sysAdminCampaignTypesService: SysAdminCampaignTypesService,
    private toasterService: ToastrService,
  ) {
    this.campaignTypeForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      active: [true, Validators.required],
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
      });
    } else {
      this.campaignTypeForm.patchValue({
        name: '',
        description: '',
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
}
