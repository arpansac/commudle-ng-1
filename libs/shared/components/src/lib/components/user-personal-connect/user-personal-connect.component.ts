import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUser } from '@commudle/shared-models';

@Component({
  selector: 'commudle-user-personal-connect',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-personal-connect.component.html',
  styleUrls: ['./user-personal-connect.component.scss'],
})
export class UserPersonalConnectComponent implements OnInit {
  @Input() userConnect: number;
  connectionValue: string | null = null;

  ngOnInit() {
    if (this.userConnect) {
      this.connectionValue = this.getConnectionValue(this.userConnect);
    }
  }

  getConnectionValue(num: number): string {
    if (num === 1) {
      return '1st';
    } else if (num === 2) {
      return '2nd';
    } else if (num === 3) {
      return '3rd';
    }
    return num.toString();
  }
}
