import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PublicHomeListHackathonsHomeageComponent } from './public-home-list-hackathons-homeage.component';

describe('PublicHomeListHackathonsHomeageComponent', () => {
  let component: PublicHomeListHackathonsHomeageComponent;
  let fixture: ComponentFixture<PublicHomeListHackathonsHomeageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicHomeListHackathonsHomeageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicHomeListHackathonsHomeageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
