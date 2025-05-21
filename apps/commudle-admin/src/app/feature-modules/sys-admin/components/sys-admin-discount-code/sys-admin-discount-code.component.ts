import { Component, OnInit, OnDestroy } from '@angular/core';
import { EDbModels, IDiscountCode, EDiscountType } from '@commudle/shared-models';
import { DiscountCodesService } from '@commudle/shared-services';
import { faAdd, faEdit, faTrash, faTicket } from '@fortawesome/free-solid-svg-icons';
import { NbDialogService, NbToastrService } from '@commudle/theme';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

@Component({
  selector: 'commudle-sys-admin-discount-code',
  templateUrl: './sys-admin-discount-code.component.html',
  styleUrls: ['./sys-admin-discount-code.component.scss'],
})
export class SysAdminDiscountCodeComponent implements OnInit, OnDestroy {
  discountCodes: IDiscountCode[] = [];
  isLoading = false;
  selectedModelType: EDbModels = EDbModels.CAMPAIGN;

  // Constants and enums
  readonly EDbModels = EDbModels;
  readonly EDiscountType = EDiscountType;

  // Icons
  readonly icons = {
    faAdd,
    faEdit,
    faTrash,
    faTicket,
  };

  // Destroy subject for unsubscribing
  private destroy$ = new Subject<void>();

  constructor(
    private discountCodesService: DiscountCodesService,
    private dialogService: NbDialogService,
    private toastrService: NbToastrService,
  ) {}

  ngOnInit(): void {
    this.getDiscountCodes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onModelTypeChange(): void {
    this.getDiscountCodes();
  }

  getDiscountCodes(): void {
    this.isLoading = true;

    this.discountCodesService
      .indexByParentOrObject(0, this.selectedModelType, false)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false)),
      )
      .subscribe({
        next: (data) => {
          this.discountCodes = data;
        },
        error: (error) => {
          console.error('Error fetching discount codes:', error);
          this.discountCodes = [];
          this.toastrService.danger('Unable to load discount codes. Please try again.', 'Error');
        },
      });
  }

  openCreateForm(): void {
    // TODO: Implement dialog form opening logic
  }

  editDiscountCode(code: IDiscountCode): void {
    // TODO: Implement edit dialog logic
  }

  deleteDiscountCode(id: number): void {
    // TODO: Implement confirmation dialog and delete logic
  }
}
