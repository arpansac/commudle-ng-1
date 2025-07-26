import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IEventDataFormEntityGroup } from 'apps/shared-models/event_data_form_enity_group.model';

@Injectable({
  providedIn: 'root',
})
export class EventDataFormEntityGroupsStore {
  private eventDataFormEntityGroups = new BehaviorSubject<IEventDataFormEntityGroup[]>([]);
  public eventDataFormEntityGroups$: Observable<IEventDataFormEntityGroup[]> =
    this.eventDataFormEntityGroups.asObservable();

  private eventDataFormEntityGroupCount = new BehaviorSubject<number>(0);
  public eventDataFormEntityGroupCount$: Observable<number> = this.eventDataFormEntityGroupCount.asObservable();

  setEventDataFormEntityGroups(eventDataFormEntityGroups: IEventDataFormEntityGroup[]): void {
    this.eventDataFormEntityGroups.next(eventDataFormEntityGroups);
    this.eventDataFormEntityGroupCount.next(eventDataFormEntityGroups.length);
  }

  addEventDataFormEntityGroup(eventDataFormEntityGroup: IEventDataFormEntityGroup): void {
    const currentGroups = this.eventDataFormEntityGroups.getValue();
    this.eventDataFormEntityGroups.next([...currentGroups, eventDataFormEntityGroup]);
    this.eventDataFormEntityGroupCount.next(currentGroups.length + 1);
  }

  removeEventDataFormEntityGroup(eventDataFormEntityGroupId: number): void {
    const currentGroups = this.eventDataFormEntityGroups.getValue();
    const updatedGroups = currentGroups.filter((group) => group.id !== eventDataFormEntityGroupId);
    this.eventDataFormEntityGroups.next(updatedGroups);
    this.eventDataFormEntityGroupCount.next(updatedGroups.length);
  }

  clearEventDataFormEntityGroups(): void {
    this.eventDataFormEntityGroups.next([]);
    this.eventDataFormEntityGroupCount.next(0);
  }
}
