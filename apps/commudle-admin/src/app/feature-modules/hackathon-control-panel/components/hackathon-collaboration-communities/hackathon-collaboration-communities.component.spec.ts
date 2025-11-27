import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HackathonCollaborationCommunitiesComponent } from './hackathon-collaboration-communities.component';

describe('HackathonCollaborationCommunitiesComponent', () => {
  let component: HackathonCollaborationCommunitiesComponent;
  let fixture: ComponentFixture<HackathonCollaborationCommunitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HackathonCollaborationCommunitiesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HackathonCollaborationCommunitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
