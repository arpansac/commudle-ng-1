import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faCircleCheck,
  faMinus,
  faPlus,
  faRotateRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { environment } from '@commudle/shared-environments';
import {
  EDbModels,
  EPurchaseOrderStatus,
  IContactInfo,
  IProductPrice,
  IPurchaseOrder,
  IRazorpayOrder,
  IRazorpayPayment,
  IUser,
} from '@commudle/shared-models';
import { AuthService, PurchaseOrderService, RazorpayService, ToastrService } from '@commudle/shared-services';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { Subject, takeUntil } from 'rxjs';
declare const Razorpay: any;

@Component({
  selector: 'commudle-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  @ViewChild('paymentErrorDialog', { static: true }) paymentErrorDialog: TemplateRef<any>;
  @ViewChild('loadingDialog', { static: true }) loadingDialog: TemplateRef<any>;

  purchaseOrder: IPurchaseOrder;
  currentUser: IUser;
  contactInfoForm: FormGroup;
  productPrice: IProductPrice;

  isLoadingPayment = false;
  paymentPaid = false;
  quantity = 1;
  minQuantity = 1;
  subscriptionMonths = 1;
  totalPrice: number;

  readonly icons = {
    faTriangleExclamation,
    faRotateRight,
    faCircleCheck,
    faPlus,
    faMinus,
  };
  readonly EPurchaseOrderStatus = EPurchaseOrderStatus;
  readonly EDbModels = EDbModels;

  private destroy$ = new Subject<void>();
  private dialogRef: NbDialogRef<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authWatchService: AuthService,
    private purchaseOrderService: PurchaseOrderService,
    private razorpayService: RazorpayService,
    private toastrService: ToastrService,
    private dialogService: NbDialogService,
  ) {
    this.initCheckoutForm();
  }

  private initCheckoutForm(): void {
    this.contactInfoForm = this.fb.group({
      companyName: ['', Validators.required],
      gst: [''],
      companyAddress: ['', Validators.required],
      pinCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.openLoadingDialog();
    this.fetchCurrentUser();
    this.activatedRoute.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => this.fetchPurchaseOrder(params['purchase_order_uuid']));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeLoadingDialog();
  }

  private fetchPurchaseOrder(purchaseOrderUuid: string): void {
    const lastSegment = this.route.snapshot.url[this.route.snapshot.url.length - 1]?.path || '';

    this.purchaseOrderService
      .showPurchaseOrder(purchaseOrderUuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IPurchaseOrder) => {
          this.purchaseOrder = data;
          this.quantity = this.purchaseOrder.quantity || 1;
          this.subscriptionMonths = this.purchaseOrder.notes.subscription_months;
          this.handleOrderStatus(lastSegment);

          // Prefill form if contact info exists
          if (this.purchaseOrder.contact_info) {
            this.prefillContactForm(this.purchaseOrder.contact_info);
          } else {
            this.updateTotalPrice();
          }
          this.closeLoadingDialog();
        },
        error: () => this.closeLoadingDialog(),
      });
  }

  private prefillContactForm(contactInfo: IContactInfo): void {
    if (!contactInfo) return;

    this.contactInfoForm.patchValue({
      companyName: contactInfo.address?.company_name || '',
      gst: contactInfo.tax_info?.gst || '',
      companyAddress: contactInfo.address?.address || '',
      pinCode: contactInfo.address?.pin_code || '',
    });
  }

  private handleOrderStatus(lastSegment: string): void {
    if (this.purchaseOrder.status === EPurchaseOrderStatus.PAID) {
      this.paymentPaid = true;
      if (lastSegment !== 'complete') {
        this.router.navigate(['checkout', this.purchaseOrder.uuid, 'complete']);
      }
    } else if (lastSegment === 'complete') {
      this.router.navigate(['checkout', this.purchaseOrder.uuid]);
    }
  }

  private fetchCurrentUser(): void {
    this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => (this.currentUser = user));
  }

  Pay(): void {
    if (!this.purchaseOrder?.id) return;

    if (this.purchaseOrder.orderable_type === EDbModels.PRODUCT_PRICE) {
      if (this.contactInfoForm.invalid) {
        this.contactInfoForm.markAllAsTouched();
        this.toastrService.errorDialog('Please fill all the required fields');
        return;
      }

      if (this.quantity < this.minQuantity) {
        this.toastrService.errorDialog(`Minimum quantity required is ${this.minQuantity}`);
        return;
      }
    }

    this.isLoadingPayment = true;
    if (this.purchaseOrder.orderable_type === EDbModels.PRODUCT_PRICE) {
      if (this.purchaseOrder.contact_info) {
        this.createRazorpayOrder(this.purchaseOrder.id);
      } else {
        this.createOrUpdateContactInfo();
      }
    } else {
      this.createRazorpayOrder(this.purchaseOrder.id);
    }
  }

  createOrUpdateContactInfo() {
    const contactInfo = {
      tax_info: {
        gst: this.contactInfoForm.get('gst').value,
      },
      address: {
        address: this.contactInfoForm.get('companyAddress').value,
        company_name: this.contactInfoForm.get('companyName').value,
        pin_code: this.contactInfoForm.get('pinCode').value,
      },
    };

    this.purchaseOrderService.createContactInfo(this.purchaseOrder.uuid, contactInfo).subscribe(
      (data) => {
        if (data) {
          this.createRazorpayOrder(this.purchaseOrder.id);
        } else {
          this.isLoadingPayment = false;
          this.toastrService.errorDialog('Failed to save contact information');
        }
      },
      (error) => {
        this.isLoadingPayment = false;
        this.toastrService.errorDialog('Failed to save contact information', error);
      },
    );
  }

  private createRazorpayOrder(purchaseOrderId: number): void {
    // Calculate total amount based on quantity and subscription months
    let totalAmount = this.purchaseOrder.amount * this.quantity;

    // If subscription months is applicable, multiply by it
    if (this.productPrice?.min_subscription_duration_months && this.subscriptionMonths) {
      totalAmount = totalAmount * (this.subscriptionMonths / this.productPrice.min_subscription_duration_months);
    }

    const orderDetails = {
      amount: Math.round(totalAmount),
      currency: this.purchaseOrder.currency,
      subscription_months: this.subscriptionMonths,
    };

    this.razorpayService
      .createOrFindOrder(orderDetails, { po_id: purchaseOrderId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IRazorpayOrder) => this.razorPaySubmit(data),
        error: () => (this.isLoadingPayment = false),
      });
  }

  private razorPaySubmit(order: IRazorpayOrder): void {
    if (!order?.rzp_order_id) return;

    const options = {
      key: environment.razorpay_key,
      order_id: order.rzp_order_id,
      handler: (response: unknown) => {
        this.openLoadingDialog();
        this.razorpayService
          .createOrUpdatePayment(response, false, order?.razorpay_payment?.rzp_payment_id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data: IRazorpayPayment) => {
              if (data) {
                this.toastrService.successDialog('Your Payment Was Received Successfully');
                this.paymentPaid = true;
                this.router.navigate(['checkout', this.purchaseOrder.uuid, 'complete']);
              }
            },
            error: () => {},
            complete: () => {
              this.isLoadingPayment = false;
              this.closeLoadingDialog();
            },
          });
      },
      prefill: {
        name: this.currentUser?.name || '',
        email: this.currentUser?.email || '',
        contact: this.currentUser?.phone || '',
      },
      modal: {
        escape: false,
        reload: false,
        ondismiss: () => {
          this.isLoadingPayment = false;
          this.dialogService.open(this.paymentErrorDialog, {
            closeOnBackdropClick: false,
          });
        },
      },
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      this.razorpayService
        .createOrUpdatePayment(response.error, true, order?.razorpay_payment?.rzp_payment_id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.isLoadingPayment = false;
            this.toastrService.errorDialog(`Payment failed: ${response.error.description}`);
            this.reload();
          },
          error: () => (this.isLoadingPayment = false),
        });
    });

    rzp.open();
  }

  reload(): void {
    window.location.reload();
  }

  increaseQuantity(): void {
    this.quantity++;
    this.purchaseOrderService
      .updatePurchaseOrder(this.purchaseOrder.uuid, {
        quantity: this.quantity,
      })
      .subscribe((po: IPurchaseOrder) => {
        this.purchaseOrder = po;
        this.updateTotalPrice();
      });
  }

  decreaseQuantity(): void {
    if (this.quantity > this.minQuantity) {
      this.quantity--;
      this.purchaseOrderService
        .updatePurchaseOrder(this.purchaseOrder.uuid, {
          quantity: this.quantity,
        })
        .subscribe((po: IPurchaseOrder) => {
          this.purchaseOrder = po;
          this.updateTotalPrice();
        });
    }
  }

  onProductPriceLoaded(productPrice: IProductPrice): void {
    if (productPrice) {
      this.productPrice = productPrice;
      this.minQuantity = productPrice.min_quantity || 1;
      this.quantity = Math.max(this.minQuantity, this.quantity);
      this.updateTotalPrice();
    }
  }

  increaseMonths(): void {
    if (!this.productPrice?.min_subscription_duration_months) return;

    // Increase by the minimum subscription duration
    this.subscriptionMonths += this.productPrice.min_subscription_duration_months;

    this.purchaseOrderService
      .updatePurchaseOrder(this.purchaseOrder.uuid, {
        subscription_months: this.subscriptionMonths,
      })
      .subscribe((po: IPurchaseOrder) => {
        this.purchaseOrder = po;
        this.updateTotalPrice();
      });
  }

  decreaseMonths(): void {
    if (!this.productPrice?.min_subscription_duration_months) return;

    // Don't go below the minimum subscription duration
    if (this.subscriptionMonths <= this.productPrice.min_subscription_duration_months) return;

    // Decrease by the minimum subscription duration
    this.subscriptionMonths -= this.productPrice.min_subscription_duration_months;

    this.purchaseOrderService
      .updatePurchaseOrder(this.purchaseOrder.uuid, {
        subscription_months: this.subscriptionMonths,
      })
      .subscribe((po: IPurchaseOrder) => {
        this.purchaseOrder = po;
        this.updateTotalPrice();
      });
  }

  private updateTotalPrice(): void {
    if (!this.purchaseOrder?.amount_to_be_paid) return;

    this.totalPrice = this.purchaseOrder.amount_to_be_paid / 100;
  }

  private openLoadingDialog(): void {
    this.closeLoadingDialog(); // Close any existing dialog first

    this.dialogRef = this.dialogService.open(this.loadingDialog, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      hasScroll: false,
    });
  }

  private closeLoadingDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }
}
