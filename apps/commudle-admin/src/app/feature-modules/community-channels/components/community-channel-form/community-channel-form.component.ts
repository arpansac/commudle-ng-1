/* eslint-disable @nx/enforce-module-boundaries */
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ICommunityChannel } from 'apps/shared-models/community-channel.model';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { EDiscussionType } from 'apps/commudle-admin/src/app/feature-modules/community-channels/model/discussion-type.enum';
import { Subscription } from 'rxjs';
import { CommunityChannelManagerService, CommunityChannelsService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { EDbModels } from '@commudle/shared-models';

@Component({
  selector: 'commudle-community-channel-form',
  templateUrl: './community-channel-form.component.html',
  styleUrls: ['./community-channel-form.component.scss'],
  standalone: false,
})
export class CommunityChannelFormComponent implements OnInit, OnDestroy {
  @Input() existingChannel: ICommunityChannel;
  @Input() presetGroupName;
  @Input() discussionType: string;
  EDiscussionType = EDiscussionType;

  @Output() saved = new EventEmitter();

  @ViewChild('defaultConfirmDialog', { static: true }) defaultConfirmDialog: TemplateRef<any>;

  uploadedLogoImageFile: File;
  uploadedLogoImage;

  // community channel form
  communityChannelForm;

  subscriptions: Subscription[] = [];
  parentId: number;
  parentType: EDbModels;
  existingDefaultChannel: ICommunityChannel;

  constructor(
    private cmService: CommunityChannelManagerService,
    private communityChannelsService: CommunityChannelsService,
    private fb: FormBuilder,
    private toastLogService: LibToastLogService,
    private dialogService: NbDialogService,
  ) {
    this.communityChannelForm = this.fb.group({
      logo: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      group_name: ['General', this.discussionType === 'forum' ? Validators.required : ''],
      is_private: [false, Validators.required],
      is_readonly: [false, Validators.required],
      display_type: [this.discussionType],
      default: [false],
    });
  }

  ngOnInit() {
    this.subscriptions.push(
      this.cmService.parent$.subscribe((parent) => {
        if (parent) {
          this.parentId = parent.id;
        }
      }),
      this.cmService.parentType$.subscribe((parentType) => {
        if (parentType) {
          this.parentType = parentType;
        }
      }),
    );
    if (this.presetGroupName) {
      this.communityChannelForm.patchValue({
        group_name: this.presetGroupName,
      });
    }
    if (this.discussionType) {
      this.communityChannelForm.patchValue({
        display_type: this.discussionType,
      });
    }

    if (this.existingChannel) {
      this.communityChannelForm.patchValue({
        name: this.existingChannel.name,
        description: this.existingChannel.description,
        group_name: this.existingChannel.group_name,
        is_private: this.existingChannel.is_private,
        is_readonly: this.existingChannel.is_readonly,
        default: this.existingChannel.default,
      });
    }
  }

  submitForm() {
    if (this.communityChannelForm.value.default && this.parentId && this.parentType) {
      this.communityChannelsService.getDefaultChannel(this.parentId, this.parentType).subscribe((defaultChannel) => {
        if (defaultChannel && (!this.existingChannel || defaultChannel.id !== this.existingChannel.id)) {
          this.existingDefaultChannel = defaultChannel;
          const dialogRef = this.dialogService.open(this.defaultConfirmDialog, {
            closeOnBackdropClick: false,
          });
          dialogRef.onClose.subscribe((confirmed) => {
            if (confirmed) {
              this.proceedSubmit();
            }
          });
        } else {
          this.proceedSubmit();
        }
      });
    } else {
      this.proceedSubmit();
    }
  }

  private proceedSubmit() {
    const formData: any = new FormData();

    const communityChannelFormData = this.communityChannelForm.value;
    Object.keys(communityChannelFormData).forEach((key) =>
      !(communityChannelFormData[key] == null)
        ? formData.append(`community_channel[${key}]`, communityChannelFormData[key])
        : '',
    );

    if (this.uploadedLogoImageFile) {
      formData.append('community_channel[logo]', this.uploadedLogoImageFile);
    }

    if (this.existingChannel) {
      this.updateChannel(formData);
    } else {
      if (this.discussionType === EDiscussionType.FORUM) {
        this.createForum(formData);
      } else if (this.discussionType === EDiscussionType.CHANNEL) {
        this.createChannel(formData);
      }
    }
  }

  async createChannel(formData) {
    const isCreated = await this.cmService.createChannel(formData);
    if (isCreated) {
      this.removePreviousDefault();
      this.saved.emit(); //help to close the popup
    }
  }

  async createForum(formData) {
    const isCreated = await this.cmService.createChannel(formData);
    if (isCreated) {
      this.removePreviousDefault();
      this.saved.emit(); //help to close the popup
    }
  }

  displaySelectedLogo(event: any) {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2425190) {
        this.toastLogService.warningDialog('Image should be less than 2 Mb', 3000);
        return;
      }
      this.uploadedLogoImageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedLogoImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo() {
    this.uploadedLogoImage = null;
    this.uploadedLogoImageFile = null;
    this.communityChannelForm.get('logo').patchValue('');

    // if we are editing the community channel here, then send a request to the server to remove the logo
    if (this.existingChannel && this.existingChannel.logo) {
      this.communityChannelsService.deleteChannelForumLogo(this.existingChannel.id).subscribe((data) => {
        if (data) {
          this.existingChannel.logo = null;
          this.cmService.findAndUpdateChannel(this.existingChannel);
        }
      });
    }
  }

  updateChannel(formData) {
    this.communityChannelsService.updateChannelForum(this.existingChannel.id, formData).subscribe((data) => {
      if (data) {
        this.existingChannel = data;
        this.removePreviousDefault();
        this.cmService.findAndUpdateChannel(data);
        this.cmService.updateChannel(data);
        this.toastLogService.successDialog('Updated');
        this.saved.emit(); //help to close the popup
      }
    });
  }

  private removePreviousDefault() {
    if (this.existingDefaultChannel) {
      this.existingDefaultChannel.default = false;
      this.cmService.findAndUpdateChannel(this.existingDefaultChannel);
      this.existingDefaultChannel = null;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
