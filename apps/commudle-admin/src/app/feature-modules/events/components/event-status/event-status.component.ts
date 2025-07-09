import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { EventsService } from 'apps/commudle-admin/src/app/services/events.service';
import { EEventStatuses } from 'apps/shared-models/enums/event_statuses.enum';
import { NbDialogService } from '@commudle/theme';
import { ToastrService } from '@commudle/shared-services';
import { IEvent, IEventStatus } from '@commudle/shared-models';
import { EventDataFormEntityGroupsService } from 'apps/commudle-admin/src/app/services/event-data-form-entity-groups.service';
import { Router } from '@angular/router';

@Component({
  selector: 'commudle-event-status',
  templateUrl: './event-status.component.html',
  styleUrls: ['./event-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventStatusComponent implements OnInit {
  @Input() event: IEvent;
  @Output() updatedEventStatus: EventEmitter<IEventStatus> = new EventEmitter<IEventStatus>();
  isMobileView = false;
  eventDataFormCounts = 0;
  @ViewChild('completeStatusConfirmationPopup') completeStatusConfirmationPopup: TemplateRef<any>;
  @ViewChild('confirmOpenEventStatusDialogBox') confirmOpenEventStatusDialogBox: TemplateRef<any>;

  eventStatuses: string[] = Object.values(EEventStatuses);
  selectedItem = this.eventStatuses[1];

  constructor(
    private eventsService: EventsService,
    private toastLogService: ToastrService,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: NbDialogService,
    private eventDataFormEntityGroupsService: EventDataFormEntityGroupsService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.isMobileView = window.innerWidth <= 640;
    this.getEventDataFormEntityGroups();
  }

  openConfirmationPopup(status: string) {
    if (!status || status === this.event.event_status.name) return;

    const previousStatus = this.event.event_status.name;

    this.event.event_status.name = status;
    this.changeDetectorRef.markForCheck();

    if (status === EEventStatuses.COMPLETED) {
      this.dialogService
        .open(this.completeStatusConfirmationPopup, { context: { status } })
        .onClose.subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.updateStatus(status);
          } else {
            this.event.event_status.name = previousStatus;
            this.changeDetectorRef.markForCheck();
          }
        });
    } else if (status === EEventStatuses.OPEN) {
      if (this.eventDataFormCounts === 0) {
        this.dialogService
          .open(this.confirmOpenEventStatusDialogBox, { context: { status } })
          .onClose.subscribe((buttonStatus: number) => {
            if (buttonStatus === 1) {
              this.updateStatus(status);
            } else if (buttonStatus === 0) {
              this.event.event_status.name = previousStatus;
              this.router.navigate([
                '/admin',
                'communities',
                this.event.kommunity.slug,
                'event-dashboard',
                this.event.slug,
                'registrations',
              ]);
              this.changeDetectorRef.markForCheck();
            } else {
              this.event.event_status.name = previousStatus;
              this.changeDetectorRef.markForCheck();
            }
          });
        this.changeDetectorRef.markForCheck();
      } else {
        this.updateStatus(status);
      }
    } else {
      this.updateStatus(status);
    }
  }

  updateStatus(status: string) {
    this.eventsService.updateStatus(this.event.id, status).subscribe((value: IEventStatus) => {
      this.updatedEventStatus.emit(value);
      this.toastLogService.successDialog('Status Updated!');
      this.changeDetectorRef.markForCheck();
    });
  }

  getEventDataFormEntityGroups() {
    this.eventDataFormEntityGroupsService.getEventDataFormEntityGroups(this.event.id).subscribe((data) => {
      this.eventDataFormCounts = data.event_data_form_entity_groups.length;
      this.changeDetectorRef.markForCheck();
    });
  }
}
