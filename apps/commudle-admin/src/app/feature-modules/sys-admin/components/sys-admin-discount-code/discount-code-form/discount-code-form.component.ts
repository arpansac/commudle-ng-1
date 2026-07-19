import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EDbModels, EDiscountType, IDiscountCode } from '@commudle/shared-models';
import { DiscountCodesService, ToastrService } from '@commudle/shared-services';
import { NbDialogRef } from '@commudle/theme';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';

@Component({
  selector: 'commudle-discount-code-form',
  templateUrl: './discount-code-form.component.html',
  styleUrls: ['./discount-code-form.component.scss'],
  standalone: false,
})
export class DiscountCodeFormComponent implements OnInit {
  @Input() discountCode?: IDiscountCode;
  @Input() modelType: EDbModels = EDbModels.CAMPAIGN;
  @Input() isEdit = false;

  discountCodeForm!: FormGroup;
  isSubmitting = false;

  // Constants and enums
  readonly EDiscountType = EDiscountType;
  readonly EDbModels = EDbModels;

  // Icons
  readonly icons = {
    faClose,
  };

  constructor(
    private fb: FormBuilder,
    private discountCodesService: DiscountCodesService,
    private dialogRef: NbDialogRef<DiscountCodeFormComponent>,
    private toastrService: ToastrService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    if (this.isEdit && this.discountCode) {
      this.patchFormValues();
    }
  }

  /** Preset options for the per-user usage cap. `null` means unlimited (lifetime). */
  readonly usagePresets: { label: string; value: number | null }[] = [
    { label: 'Unlimited (applies on every renewal)', value: null },
    { label: 'One-time per customer', value: 1 },
    { label: '3 uses per customer', value: 3 },
    { label: '5 uses per customer', value: 5 },
    { label: '10 uses per customer', value: 10 },
    { label: 'Custom…', value: -1 },
  ];

  /** True when the admin picked "Custom…" from the preset dropdown. */
  showCustomUsageInput = false;

  initForm(): void {
    this.discountCodeForm = this.fb.group({
      code: ['', [Validators.required]],
      discount_type: [EDiscountType.PERCENTAGE, [Validators.required]],
      discount_value: [null, [Validators.required, Validators.min(1)]],
      object_type: [this.modelType, [Validators.required]],
      is_limited: [false],
      max_limit: [{ value: null, disabled: true }],
      min_users_count: [null, [Validators.min(0)]],
      max_users_count: [null, [Validators.min(1)]],
      max_applications_per_user: [null], // null = unlimited (lifetime)
      usage_preset: [null], // UI-only control that drives max_applications_per_user
      expires_at: [null],
    });

    // Preset dropdown → set the actual field. Selecting "Custom" reveals a number input.
    this.discountCodeForm.get('usage_preset')?.valueChanges.subscribe((preset) => {
      if (preset === -1) {
        this.showCustomUsageInput = true;
        // don't reset max_applications_per_user — let the admin type
      } else {
        this.showCustomUsageInput = false;
        this.discountCodeForm.get('max_applications_per_user')?.setValue(preset, { emitEvent: false });
      }
    });

    // Add conditional validation for max_limit
    this.discountCodeForm.get('is_limited')?.valueChanges.subscribe((isLimited) => {
      const maxLimitControl = this.discountCodeForm.get('max_limit');

      if (maxLimitControl) {
        if (isLimited) {
          maxLimitControl.setValidators([Validators.required, Validators.min(1)]);
          maxLimitControl.enable();
        } else {
          maxLimitControl.clearValidators();
          maxLimitControl.disable();
        }

        maxLimitControl.updateValueAndValidity();
      }
    });

    // Add conditional validation for discount_value based on discount_type
    this.discountCodeForm.get('discount_type')?.valueChanges.subscribe((type) => {
      const discountValueControl = this.discountCodeForm.get('discount_value');

      if (discountValueControl) {
        if (type === EDiscountType.PERCENTAGE) {
          discountValueControl.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
        } else {
          discountValueControl.setValidators([Validators.required, Validators.min(1)]);
        }

        discountValueControl.updateValueAndValidity();
      }
    });
  }

  patchFormValues(): void {
    if (!this.discountCode) return;

    // Format date for datetime-local input
    let expiryDate = null;
    if (this.discountCode.expires_at) {
      const date = new Date(this.discountCode.expires_at);
      expiryDate = this.formatDateForInput(date);
    }

    // Map the saved value back onto a preset if it matches one; otherwise mark as Custom.
    const savedCap = this.discountCode.max_applications_per_user ?? null;
    const matchedPreset = this.usagePresets.find((p) => p.value === savedCap);
    const usagePreset = matchedPreset ? matchedPreset.value : -1;
    this.showCustomUsageInput = usagePreset === -1;

    this.discountCodeForm.patchValue({
      code: this.discountCode.code,
      discount_type: this.discountCode.discount_type,
      discount_value:
        this.discountCode.discount_type === EDiscountType.FIXED_AMOUNT
          ? this.discountCode.discount_value / 100
          : this.discountCode.discount_value,
      object_type: this.discountCode.object_type || this.modelType,
      max_limit: this.discountCode.max_limit,
      min_users_count: this.discountCode.min_users_count,
      max_users_count: this.discountCode.max_users_count,
      max_applications_per_user: savedCap,
      usage_preset: usagePreset,
      expires_at: expiryDate,
    });
  }

  onSubmit(): void {
    if (this.discountCodeForm.invalid) return;

    // Ensure code is uppercase before submitting
    const codeControl = this.discountCodeForm.get('code');
    const expireAtControl = this.discountCodeForm.get('expires_at');
    const discountTypeControl = this.discountCodeForm.get('discount_type');
    const discountValueControl = this.discountCodeForm.get('discount_value');
    if (codeControl && codeControl.value) {
      codeControl.setValue(codeControl.value.toUpperCase());
    }

    this.discountCodeForm.patchValue({
      expires_at: moment(expireAtControl.value).local(),
    });

    if (discountTypeControl && discountTypeControl.value === EDiscountType.FIXED_AMOUNT) {
      discountValueControl.setValue(discountValueControl.value * 100);
    }

    // Strip the UI-only preset control before sending, and normalize an empty custom
    // input to null (= unlimited) rather than an empty string. The service signature
    // types the payload as IDiscountCode (all fields required) but the backend accepts
    // a partial — cast through unknown to satisfy the strict signature.
    const raw = { ...this.discountCodeForm.value } as Record<string, unknown>;
    delete raw.usage_preset;
    if (raw.max_applications_per_user === '' || raw.max_applications_per_user === undefined) {
      raw.max_applications_per_user = null;
    }
    const payload = raw as unknown as IDiscountCode;

    this.isSubmitting = true;

    if (this.isEdit && this.discountCode) {
      this.updateDiscountCode(payload);
    } else {
      this.createDiscountCode(payload);
    }
  }

  createDiscountCode(payload: IDiscountCode): void {
    this.discountCodesService.createDiscountCode({ discount_code: payload }).subscribe((data) => {
      this.toastrService.successDialog('Discount code created successfully');
      this.dialogRef.close(data);
    });
  }

  updateDiscountCode(payload: IDiscountCode): void {
    this.discountCodesService
      .updateDiscountCodes({ discount_code: payload }, this.discountCode.id)
      .subscribe((data) => {
        this.toastrService.successDialog('Discount code updated successfully');
        this.dialogRef.close(data);
      });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  convertToUppercase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    this.discountCodeForm.get('code').setValue(value, { emitEvent: false });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
