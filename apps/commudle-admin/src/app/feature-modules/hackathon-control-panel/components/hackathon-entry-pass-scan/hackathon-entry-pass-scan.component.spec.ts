import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HackathonEntryPassScanComponent } from './hackathon-entry-pass-scan.component';

describe('HackathonEntryPassScanComponent', () => {
  let component: HackathonEntryPassScanComponent;
  let fixture: ComponentFixture<HackathonEntryPassScanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HackathonEntryPassScanComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HackathonEntryPassScanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
