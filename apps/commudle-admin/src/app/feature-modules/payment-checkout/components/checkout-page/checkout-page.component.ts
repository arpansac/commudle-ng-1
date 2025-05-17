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
  IPurchaseOrder,
  IRazorpayOrder,
  IRazorpayPayment,
  IUser,
} from '@commudle/shared-models';
import { AuthService, PurchaseOrderService, RazorpayService, ToastrService } from '@commudle/shared-services';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { Subject, Subscription, takeUntil } from 'rxjs';
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
  checkoutForm: FormGroup;

  readonly icons = {
    faTriangleExclamation,
    faRotateRight,
    faCircleCheck,
    faPlus,
    faMinus,
  };

  readonly EPurchaseOrderStatus = EPurchaseOrderStatus;
  readonly EDbModels = EDbModels;

  isLoadingPayment = false;
  paymentPaid = false;
  quantity = 1;
  totalPrice: number;

  private destroy$ = new Subject<void>();
  private dialogRef: NbDialogRef<any>;
  private subscriptions: Subscription[] = [];

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
    this.checkoutForm = this.fb.group({
      address: ['', Validators.required],
      gst: [''],
      notes: [''],
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
          this.handleOrderStatus(lastSegment);
          this.closeLoadingDialog();
        },
        error: () => this.closeLoadingDialog(),
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

    this.isLoadingPayment = true;
    this.createRazorpayOrder(this.purchaseOrder.id);
  }

  private createRazorpayOrder(purchaseOrderId: number): void {
    const orderDetails = {
      amount: Math.round(this.purchaseOrder.amount_to_be_paid),
      currency: this.purchaseOrder.currency,
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
    this.updateTotalPrice();
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateTotalPrice();
    }
  }

  private updateTotalPrice(): void {
    if (!this.purchaseOrder?.amount_to_be_paid) return;

    const basePrice = this.purchaseOrder.amount_to_be_paid / 100;
    this.totalPrice = basePrice * this.quantity;
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
