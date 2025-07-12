import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowMoreBuildsComponent } from './show-more-builds.component';

describe('ShowMoreBuildsComponent', () => {
  let component: ShowMoreBuildsComponent;
  let fixture: ComponentFixture<ShowMoreBuildsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowMoreBuildsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowMoreBuildsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
