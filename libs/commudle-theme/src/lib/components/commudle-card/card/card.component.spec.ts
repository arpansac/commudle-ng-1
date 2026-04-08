import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommudleThemeModule } from '../../../commudle-theme.module';

@Component({
  standalone: false,
  template: `
    <com-card [status]="'primary'" [size]="'medium'">
      <com-card-header>Title</com-card-header>
      <com-card-body>Content</com-card-body>
      <com-card-footer>Footer</com-card-footer>
    </com-card>
  `,
})
class TestHostComponent {}

describe('ComCardComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommudleThemeModule],
      declarations: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should render card structure', () => {
    const el: HTMLElement = fixture.nativeElement;
    const root = el.querySelector('.card');
    expect(root).toBeTruthy();
    expect(root?.classList.contains('primary')).toBe(true);
    expect(root?.classList.contains('medium')).toBe(true);
    expect(el.querySelector('.com-card__header')?.textContent).toContain('Title');
    expect(el.querySelector('.com-card__body')?.textContent).toContain('Content');
    expect(el.querySelector('.com-card__footer')?.textContent).toContain('Footer');
  });
});
