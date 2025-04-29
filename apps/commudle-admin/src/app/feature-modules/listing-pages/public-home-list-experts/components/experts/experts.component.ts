import { Component, Input, OnChanges } from '@angular/core';
import { IBadge, IPagination, IUser } from '@commudle/shared-models';

interface badgesList {
  badge: IBadge;
  users: IPagination<IUser>;
}
@Component({
  selector: 'commudle-experts',
  templateUrl: './experts.component.html',
  styleUrls: ['./experts.component.scss'],
})
export class ExpertsComponent implements OnChanges {
  @Input() expertBadges: IBadge[] = [];
  @Input() startSlice = 0;
  @Input() endSlice: number;
  filteredExpertBadges: IBadge[] = [];
  badgesList: badgesList[] = [];
  showSpinner = true;

  constructor() {}

  ngOnChanges(): void {
    this.showSpinner = true;
    if (this.expertBadges && this.expertBadges.length > 0) {
      this.expertBadges.forEach((expertBadge) => {
        if (expertBadge) {
          this.filteredExpertBadges.push(expertBadge);
        }
        this.showSpinner = false;
      });
    }
  }
}
