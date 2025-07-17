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
  ICampaign,
  EDiscountType,
} from '@commudle/shared-models';
import {
  AuthService,
  DiscountCodesService,
  GoogleTagManagerService,
  PurchaseOrderService,
  RazorpayService,
  SeoService,
  ToastrService,
} from '@commudle/shared-services';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { Subject, finalize, takeUntil } from 'rxjs';

declare const Razorpay: any;

@Component({
  selector: 'commudle-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  @ViewChild('paymentErrorDialog', { static: true }) paymentErrorDialog!: TemplateRef<unknown>;
  @ViewChild('loadingDialog', { static: true }) loadingDialog!: TemplateRef<unknown>;

  purchaseOrder!: IPurchaseOrder;
  currentUser!: IUser;
  contactInfoForm: FormGroup;
  productPrice?: IProductPrice;

  isLoadingPayment = false;

  totalPrice = 0;
  totalTaxAmount = 0;
  campaign?: ICampaign;
  paymentPaid = false;

  quantity = 1;
  minQuantity = 1;
  subscriptionMonths = 1;

  discountCode = '';
  discountCodeApplied = false;
  discountAmount = 0;
  discountType?: EDiscountType;
  finalDiscountAmount = 0;

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
  private dialogRef?: NbDialogRef<unknown>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private authWatchService: AuthService,
    private purchaseOrderService: PurchaseOrderService,
    private razorpayService: RazorpayService,
    private toastrService: ToastrService,
    private dialogService: NbDialogService,
    private discountCodesService: DiscountCodesService,
    private gtm: GoogleTagManagerService,
    private seoService: SeoService,
  ) {
    this.contactInfoForm = this.initCheckoutForm();
  }

  private initCheckoutForm(): FormGroup {
    return this.fb.group({
      companyName: ['', Validators.required],
      gst: [''],
      companyAddress: ['', Validators.required],
      pinCode: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.seoService.noIndex(true);
    this.openLoadingDialog();
    this.fetchCurrentUser();
    this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const purchaseOrderUuid = params['purchase_order_uuid'];
      if (purchaseOrderUuid) {
        this.fetchPurchaseOrder(purchaseOrderUuid);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeLoadingDialog();
    this.seoService.noIndex(false);
  }

  private fetchPurchaseOrder(purchaseOrderUuid: string): void {
    const lastSegment = this.activatedRoute.snapshot.url[this.activatedRoute.snapshot.url.length - 1]?.path || '';

    this.purchaseOrderService
      .showPurchaseOrder(purchaseOrderUuid)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.closeLoadingDialog()),
      )
      .subscribe({
        next: (data: IPurchaseOrder) => {
          this.purchaseOrder = data;
          this.quantity = this.purchaseOrder.quantity || 1;

          if (this.purchaseOrder.notes?.subscription_months) {
            this.subscriptionMonths = this.purchaseOrder.notes?.subscription_months;
          }

          if (this.purchaseOrder.discount_code?.code) {
            this.discountCode = this.purchaseOrder.discount_code.code;
            this.totalPrice = this.purchaseOrder.amount_to_be_paid / 100;
            this.applyDiscountCode();
          }

          this.handleOrderStatus(lastSegment);

          if (this.purchaseOrder.contact_info) {
            this.prefillContactForm(this.purchaseOrder.contact_info);
          } else {
            this.updateTotalPrice();
          }
        },
        error: () => {
          this.toastrService.errorDialog('Failed to fetch purchase order');
          this.closeLoadingDialog();
        },
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
    if (!this.purchaseOrder?.id) {
      this.toastrService.errorDialog('Invalid purchase order');
      return;
    }

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

    if (this.discountCode && this.discountCodeApplied) {
      this.validateDiscountCode((isValid) => {
        if (isValid) {
          this.proceedWithPayment();
        } else {
          this.isLoadingPayment = false;
          this.dialogService.open(this.paymentErrorDialog, {
            closeOnBackdropClick: false,
          });
        }
      });
    } else {
      this.proceedWithPayment();
    }
  }

  private proceedWithPayment(): void {
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

  private createOrUpdateContactInfo(): void {
    if (!this.purchaseOrder?.uuid) return;

    const contactInfo = {
      tax_info: {
        gst: this.contactInfoForm.get('gst')?.value || '',
      },
      address: {
        address: this.contactInfoForm.get('companyAddress')?.value || '',
        company_name: this.contactInfoForm.get('companyName')?.value || '',
        pin_code: this.contactInfoForm.get('pinCode')?.value || '',
      },
    };

    this.purchaseOrderService
      .createContactInfo(this.purchaseOrder.uuid, contactInfo)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (!this.purchaseOrder.id) {
            this.isLoadingPayment = false;
          }
        }),
      )
      .subscribe({
        next: (data) => {
          if (data && this.purchaseOrder.id) {
            this.createRazorpayOrder(this.purchaseOrder.id);
          } else {
            this.isLoadingPayment = false;
            this.toastrService.errorDialog('Failed to save contact information');
          }
        },
        error: (error) => {
          this.isLoadingPayment = false;
          this.toastrService.errorDialog('Failed to save contact information', error);
        },
      });
  }

  private createRazorpayOrder(purchaseOrderId: number): void {
    const orderDetails = {
      amount: Math.round(this.totalPrice * 100),
      currency: this.purchaseOrder.currency,
      subscription_months: this.subscriptionMonths,
    };

    this.razorpayService
      .createOrFindOrder(orderDetails, { po_id: purchaseOrderId })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (!this.isLoadingPayment) {
            this.isLoadingPayment = false;
          }
        }),
      )
      .subscribe({
        next: (data: IRazorpayOrder) => this.razorPaySubmit(data),
        error: () => {
          this.isLoadingPayment = false;
          this.toastrService.errorDialog('Failed to create payment order');
        },
      });
  }

  private razorPaySubmit(order: IRazorpayOrder): void {
    if (!order?.rzp_order_id) {
      this.toastrService.errorDialog('Invalid payment order');
      return;
    }

    const options = {
      key: environment.razorpay_key,
      order_id: order.rzp_order_id,
      handler: (response: unknown) => {
        this.openLoadingDialog();
        this.razorpayService
          .createOrUpdatePayment(response, false, order?.razorpay_payment?.rzp_payment_id)
          .pipe(
            takeUntil(this.destroy$),
            finalize(() => {
              this.isLoadingPayment = false;
              this.closeLoadingDialog();
            }),
          )
          .subscribe({
            next: (data: IRazorpayPayment) => {
              if (data) {
                if (this.purchaseOrder?.orderable_type === EDbModels.PRODUCT_PRICE) {
                  this.gtmDataLayerPushEvent('community-subscription-po-completed', {
                    com_purchase_order: this.purchaseOrder.uuid,
                    com_product_price_plan_name: this.productPrice.plan_name,
                    com_product_price_product_name: this.productPrice.product_name,
                    com_purchase_order_quantity: this.purchaseOrder.quantity,
                    com_purchase_order_subscription_months: this.purchaseOrder.notes?.subscription_months,
                  });
                }
                this.toastrService.successDialog('Your Payment Was Received Successfully');
                this.paymentPaid = true;
                this.router.navigate(['checkout', this.purchaseOrder.uuid, 'complete']);
              }
            },
            error: () => {
              if (this.purchaseOrder?.orderable_type === EDbModels.PRODUCT_PRICE) {
                this.gtmDataLayerPushEvent('community-subscription-po-completed', {
                  com_purchase_order: this.purchaseOrder.uuid,
                  com_product_price_plan_name: this.productPrice.plan_name,
                  com_product_price_product_name: this.productPrice.product_name,
                  com_purchase_order_quantity: this.purchaseOrder.quantity,
                  com_purchase_order_subscription_months: this.purchaseOrder.notes?.subscription_months,
                });
              }
              this.toastrService.errorDialog('Payment processing failed');
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
          if (this.purchaseOrder?.orderable_type === EDbModels.PRODUCT_PRICE) {
            this.gtmDataLayerPushEvent('community-subscription-po-completed', {
              com_purchase_order: this.purchaseOrder.uuid,
              com_product_price_plan_name: this.productPrice.plan_name,
              com_product_price_product_name: this.productPrice.product_name,
              com_purchase_order_quantity: this.purchaseOrder.quantity,
              com_purchase_order_subscription_months: this.purchaseOrder.notes?.subscription_months,
            });
          }
          this.dialogService.open(this.paymentErrorDialog, {
            closeOnBackdropClick: false,
          });
        },
      },
    };

    const rzp = new Razorpay(options);

    rzp.on('payment.failed', (response: { error: { description: string } }) => {
      this.razorpayService
        .createOrUpdatePayment(response.error, true, order?.razorpay_payment?.rzp_payment_id)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => (this.isLoadingPayment = false)),
        )
        .subscribe({
          next: () => {
            if (this.purchaseOrder?.orderable_type === EDbModels.PRODUCT_PRICE) {
              this.gtmDataLayerPushEvent('community-subscription-po-completed', {
                com_purchase_order: this.purchaseOrder.uuid,
                com_product_price_plan_name: this.productPrice.plan_name,
                com_product_price_product_name: this.productPrice.product_name,
                com_purchase_order_quantity: this.purchaseOrder.quantity,
                com_purchase_order_subscription_months: this.purchaseOrder.notes?.subscription_months,
              });
            }
            this.toastrService.errorDialog(`Payment failed: ${response.error.description}`);
            this.reload();
          },
          error: () => {
            if (this.purchaseOrder?.orderable_type === EDbModels.PRODUCT_PRICE) {
              this.gtmDataLayerPushEvent('community-subscription-po-completed', {
                com_purchase_order: this.purchaseOrder.uuid,
                com_product_price_plan_name: this.productPrice.plan_name,
                com_product_price_product_name: this.productPrice.product_name,
                com_purchase_order_quantity: this.purchaseOrder.quantity,
                com_purchase_order_subscription_months: this.purchaseOrder.notes?.subscription_months,
              });
            }
            this.toastrService.errorDialog('Failed to process payment failure');
          },
        });
    });

    rzp.open();
  }

  reload(): void {
    window.location.reload();
  }

  increaseQuantity(): void {
    this.quantity++;
    if (this.discountCodeApplied) {
      this.applyDiscountCode();
    } else {
      this.updatePurchaseOrder();
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > this.minQuantity) {
      this.quantity--;
      if (this.discountCodeApplied) {
        this.applyDiscountCode();
      } else {
        this.updatePurchaseOrder();
      }
    }
  }

  onProductPriceLoaded(productPrice: IProductPrice): void {
    if (!productPrice) return;

    this.seoService.setTitle(`Checkout | ${productPrice.product_name} - ${productPrice.plan_name} | Commudle`);

    this.productPrice = productPrice;
    this.minQuantity = productPrice.min_quantity || 1;
    this.quantity = Math.max(this.minQuantity, this.quantity);
    this.updateTotalPrice();
  }

  increaseMonths(): void {
    if (!this.productPrice?.min_subscription_duration_months) return;

    this.subscriptionMonths += this.productPrice.min_subscription_duration_months;
    if (this.discountCodeApplied) {
      this.applyDiscountCode();
    } else {
      this.updatePurchaseOrder();
    }
  }

  decreaseMonths(): void {
    if (!this.productPrice?.min_subscription_duration_months) return;

    if (this.subscriptionMonths <= this.productPrice.min_subscription_duration_months) return;

    this.subscriptionMonths -= this.productPrice.min_subscription_duration_months;
    if (this.discountCodeApplied) {
      this.applyDiscountCode();
    } else {
      this.updatePurchaseOrder();
    }
  }

  private openLoadingDialog(): void {
    this.closeLoadingDialog();

    this.dialogRef = this.dialogService.open(this.loadingDialog, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      hasScroll: false,
    });
  }

  private closeLoadingDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = undefined;
    }
  }

  onDiscountCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.discountCode = input.value.toUpperCase();
  }

  applyDiscountCode(): void {
    if (!this.discountCode || !this.totalPrice) {
      this.toastrService.warningDialog('Please enter a valid discount code');
      return;
    }

    this.validateDiscountCode();
  }

  private validateDiscountCode(callback?: (isValid: boolean) => void): void {
    this.discountCodesService
      .canBeApplied({
        code: this.discountCode.toUpperCase(),
        amount: (this.purchaseOrder.amount / 100) * this.quantity * this.subscriptionMonths,
        usersCount: 1,
        edfegId: null,
        eventId: null,
        objectType: this.purchaseOrder.orderable_type,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result?.can_be_applied) {
            this.discountAmount = result.discount_amount;
            this.discountCodeApplied = true;
            this.discountType = result.discount_type;
            this.finalDiscountAmount =
              this.discountType === EDiscountType.PERCENTAGE ? this.discountAmount : this.discountAmount / 100;
            this.updatePurchaseOrder();
            if (callback) callback(true);
          } else {
            this.removePromoCode();
            if (callback) callback(false);
          }
        },
        error: () => {
          this.removePromoCode();
          if (callback) callback(false);
        },
      });
  }

  removePromoCode(showRemovePromoCode = false): void {
    this.discountCodeApplied = false;
    this.discountCode = '';
    this.discountAmount = 0;
    this.finalDiscountAmount = 0;
    this.discountType = undefined;
    this.updatePurchaseOrder();

    if (showRemovePromoCode) {
      this.toastrService.successDialog('Discount code removed successfully');
    }
  }

  private updateTotalPrice(): void {
    if (!this.purchaseOrder?.amount_to_be_paid) return;

    if (this.discountCodeApplied && this.finalDiscountAmount > this.totalPrice) {
      this.calcTotalPrice();
      this.removePromoCode();
    } else {
      this.calcTotalPrice(this.discountCodeApplied ? this.finalDiscountAmount : 0);
    }
  }

  private calcTotalPrice(discountAmount = 0): void {
    if (!this.purchaseOrder?.amount) return;

    const basePrice = (this.purchaseOrder.amount / 100) * this.quantity * this.subscriptionMonths;
    this.totalPrice = Math.max(0, basePrice - discountAmount);
  }

  private updatePurchaseOrder(): void {
    if (!this.purchaseOrder?.uuid) return;

    this.purchaseOrderService
      .updatePurchaseOrder(this.purchaseOrder.uuid, {
        quantity: this.quantity,
        subscription_months: this.subscriptionMonths,
        discount_code: this.discountCode,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (po: IPurchaseOrder) => {
          this.purchaseOrder = po;
          this.updateTotalPrice();
        },
        error: () => {
          this.toastrService.errorDialog('Failed to update purchase order');
        },
      });
  }

  private gtmDataLayerPushEvent(eventName: string, eventData: Record<string, string | number> = {}): void {
    this.gtm.dataLayerPushEvent(eventName, eventData);
  }
}
