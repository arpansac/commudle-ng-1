import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorHandler } from '@angular/core';
import { AdminSpamDetectorsComponent } from './admin-spam-detectors.component';

describe('AdminSpamDetectorsComponent', () => {
  let component: AdminSpamDetectorsComponent;
  let fixture: ComponentFixture<AdminSpamDetectorsComponent>;
  let mockRouter: any;
  let mockErrorHandler: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate'),
      url: '/sys-admin/spam-detectors',
    };

    mockErrorHandler = {
      handleError: jasmine.createSpy('handleError'),
    };

    await TestBed.configureTestingModule({
      imports: [AdminSpamDetectorsComponent, ReactiveFormsModule, FormsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ErrorHandler, useValue: mockErrorHandler },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSpamDetectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.spamDetectors).toBeDefined();
    expect(component.spamDetectorForm).toBeDefined();
    expect(component.page).toBe(1);
    expect(component.count).toBe(10);
    expect(component.total).toBe(0);
  });

  it('should have a valid form structure', () => {
    const form = component.spamDetectorForm;
    expect(form.get('name')).toBeTruthy();
    expect(form.get('type')).toBeTruthy();
    expect(form.get('enabled')).toBeTruthy();
    expect(form.get('threshold')).toBeTruthy();
  });

  it('should have default form values', () => {
    const form = component.spamDetectorForm;
    expect(form.get('enabled')?.value).toBe(true);
    expect(form.get('threshold')?.value).toBe(0.8);
    expect(form.get('name')?.value).toBe('');
    expect(form.get('type')?.value).toBe('');
  });

  it('should load spam detectors on init', () => {
    expect(component.spamDetectors.length).toBeGreaterThan(0);
    expect(component.total).toBe(component.spamDetectors.length);
  });

  it('should create a new spam detector when form is valid', () => {
    const initialCount = component.spamDetectors.length;

    component.spamDetectorForm.patchValue({
      name: 'Test Detector',
      type: 'text_analysis',
      enabled: true,
      threshold: 0.9,
    });

    component.create();

    expect(component.spamDetectors.length).toBe(initialCount + 1);
    expect(component.total).toBe(component.spamDetectors.length);
  });

  it('should not create detector when form is invalid', () => {
    const initialCount = component.spamDetectors.length;

    component.spamDetectorForm.patchValue({
      name: '', // Invalid - required field
      type: 'text_analysis',
      enabled: true,
      threshold: 0.9,
    });

    component.create();

    expect(component.spamDetectors.length).toBe(initialCount);
  });

  it('should toggle detector status', () => {
    const detector = component.spamDetectors[0];
    const initialStatus = detector.enabled;

    component.toggleDetector(detector);

    expect(detector.enabled).toBe(!initialStatus);
  });

  it('should delete detector', () => {
    const initialCount = component.spamDetectors.length;
    const detectorToDelete = component.spamDetectors[0];

    component.deleteDetector(detectorToDelete);

    expect(component.spamDetectors.length).toBe(initialCount - 1);
    expect(component.total).toBe(component.spamDetectors.length);
  });

  it('should reset form with default values', () => {
    component.spamDetectorForm.patchValue({
      name: 'Test Name',
      type: 'test_type',
      enabled: false,
      threshold: 0.5,
    });

    component.spamDetectorForm.reset({
      enabled: true,
      threshold: 0.8,
    });

    expect(component.spamDetectorForm.get('enabled')?.value).toBe(true);
    expect(component.spamDetectorForm.get('threshold')?.value).toBe(0.8);
    expect(component.spamDetectorForm.get('name')?.value).toBe(null);
    expect(component.spamDetectorForm.get('type')?.value).toBe(null);
  });

  it('should change page and reload detectors', () => {
    spyOn(component, 'getSpamDetectors');

    component.changeSpamDetectorType();

    expect(component.page).toBe(1);
    expect(component.getSpamDetectors).toHaveBeenCalled();
  });

  it('should display the component title', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Spam Detectors Management');
  });

  it('should show create detector form', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.create-detector-card')).toBeTruthy();
    expect(compiled.querySelector('form')).toBeTruthy();
  });

  it('should show detectors list', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.detectors-list-card')).toBeTruthy();
    expect(compiled.querySelector('.detectors-list')).toBeTruthy();
  });
});
