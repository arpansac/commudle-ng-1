import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NbDialogService } from '@commudle/theme';
import { SysAdminCampaignTypesService } from 'apps/commudle-admin/src/app/feature-modules/sys-admin/services/sys-admin-campaign-types.service';

@Component({
  selector: 'commudle-campaign-types',
  templateUrl: './campaign-types.component.html',
  styleUrls: ['./campaign-types.component.scss'],
})
export class CampaignTypesComponent implements OnInit {
  campaignTypeForm: FormGroup;
  campaignTypes;

  constructor(
    private dialogService: NbDialogService,
    private fb: FormBuilder,
    private sysAdminCampaignTypesService: SysAdminCampaignTypesService,
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
    this.sysAdminCampaignTypesService.getCampaignTypes().subscribe((res) => {
      this.campaignTypes = res;
      console.log('🚀 ~ CampaignTypesComponent ~ this.sysAdminCampaignTypesService.getCampaignTypes ~ res:', res);
    });
  }

  openDialog(dialog) {
    this.dialogService.open(dialog);
  }

  create() {
    this.sysAdminCampaignTypesService.createCampaignType(this.campaignTypeForm.value).subscribe((res) => {
      this.campaignTypes.push(res);
    });
  }
}
