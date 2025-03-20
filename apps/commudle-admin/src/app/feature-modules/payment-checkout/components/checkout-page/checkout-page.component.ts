import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@commudle/shared-environments';
import {
  IPurchaseOrder,
  IRazorpayOrder,
  IUser,
  EPurchaseOrderStatus,
  EDbModels,
  ICampaign,
  IRazorpayPayment,
} from '@commudle/shared-models';
import {
  CampaignService,
  countries_details,
  PurchaseOrderService,
  RazorpayService,
  ToastrService,
} from '@commudle/shared-services';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { LibAuthwatchService } from 'apps/shared-services/lib-authwatch.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { faTriangleExclamation, faRotateRight, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
declare const Razorpay: any;
@Component({
  selector: 'commudle-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
})
export class CheckoutPageComponent implements OnInit, OnDestroy {
  purchaseOrder: IPurchaseOrder;
  currentUser: IUser;
  isLoadingPayment = false;
  subscriptions: Subscription[] = [];
  icons = {
    faTriangleExclamation,
    faRotateRight,
    faCircleCheck,
  };
  totalPrice: number;
  totalTaxAmount: number;
  countryDetails = countries_details;
  EPurchaseOrderStatus = EPurchaseOrderStatus;
  campaign: ICampaign;
  paymentPaid = false;
  private dialogRef: NbDialogRef<any>;

  @ViewChild('paymentErrorDialog', { static: true }) paymentErrorDialog: TemplateRef<any>;
  @ViewChild('loadingDialog', { static: true }) loadingDialog: TemplateRef<any>;

  private destroy$ = new Subject<void>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private purchaseOrderService: PurchaseOrderService,
    private razorpayService: RazorpayService,
    private toastrService: ToastrService,
    private authWatchService: LibAuthwatchService,
    private dialogService: NbDialogService,
    private campaignService: CampaignService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.openLoadingDilaogbox();
    this.fetchCurrentUser();
    this.activatedRoute.params.subscribe((params) => {
      this.fetchPurchaseOrder(params['purchase_order_uuid']);
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
    this.closeLoadingDialogBox();
  }

  fetchPurchaseOrder(purchaseOrderUuid) {
    const lastSegment = this.route.snapshot.url[this.route.snapshot.url.length - 1]?.path || '';
    this.purchaseOrderService.showPurchaseOrder(purchaseOrderUuid).subscribe((data: IPurchaseOrder) => {
      this.purchaseOrder = data;
      if (this.purchaseOrder.status === EPurchaseOrderStatus.PAID) {
        this.paymentPaid = true;
        if (lastSegment !== 'complete') {
          this.router.navigate(['checkout', this.purchaseOrder.uuid, 'complete']);
        }
      } else {
        if (lastSegment === 'complete') {
          this.router.navigate(['checkout', this.purchaseOrder.uuid]);
        }
      }
      this.purchaseOrder.currency_symbol = this.countryDetails.find(
        (detail) => detail.currency === this.purchaseOrder.currency,
      ).symbol;
      this.fetchParent();
    });
  }

  fetchParent() {
    switch (this.purchaseOrder.orderable_type) {
      case EDbModels.CAMPAIGN:
        this.campaignService.fetchCampaign(this.purchaseOrder.orderable_id).subscribe((campaign) => {
          this.campaign = campaign;
          this.closeLoadingDialogBox();
        });
        break;
      default:
        break;
    }
  }

  fetchCurrentUser() {
    this.subscriptions.push(
      this.authWatchService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
        this.currentUser = data;
      }),
    );
  }

  Pay() {
    this.isLoadingPayment = true;
    this.createOrUpdateRazorpayOrder(this.purchaseOrder.id);
  }

  createOrUpdateRazorpayOrder(poId) {
    this.isLoadingPayment = true;

    const orderDetails = {
      amount: Math.round(this.purchaseOrder.amount_to_be_paid),
      currency: this.purchaseOrder.currency,
    };
    this.razorpayService.createOrFindOrder(orderDetails, { po_id: poId }).subscribe(
      (data: IRazorpayOrder) => {
        this.razorPaySubmit(data);
      },
      (error) => {
        this.isLoadingPayment = false;
      },
    );
  }

  razorPaySubmit(order: IRazorpayOrder) {
    this.isLoadingPayment = true;
    const options = {
      key: environment.razorpay_key,
      order_id: order.rzp_order_id,
      handler: (response: unknown) => {
        {
          this.razorpayService
            .createOrUpdatePayment(response, false, order?.razorpay_payment?.rzp_payment_id)
            .subscribe(
              (data: IRazorpayPayment) => {
                if (data) {
                  this.toastrService.successDialog('Your Payment Was Received Successfully');
                  this.isLoadingPayment = false;
                  this.paymentPaid = true;
                  this.router.navigate(['checkout', this.purchaseOrder.uuid, 'complete']);
                }
              },
              (error) => {
                this.isLoadingPayment = false;
              },
            );
        }
      },
      prefill: {
        name: this.currentUser.name,
        email: this.currentUser.email,
        contact: this.currentUser.phone ? this.currentUser.phone : '',
      },
      modal: {
        escape: false,
        reload: false,
        ondismiss: () => {
          console.error('Checkout form closed by the user');
          this.isLoadingPayment = false;
          this.dialogService.open(this.paymentErrorDialog, {
            closeOnBackdropClick: false,
          });
        },
      },
    };
    const rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', (response: any) => {
      {
        this.razorpayService
          .createOrUpdatePayment(response.error, true, order?.razorpay_payment?.rzp_payment_id)
          .subscribe((data) => {
            this.isLoadingPayment = false;
            const userConfirmed = confirm('Message from Razorpay:' + response.error.description);
            if (userConfirmed) {
              this.reload();
            } else {
              this.reload();
            }
          });
      }
    });
    rzp1.open();
  }

  // Reloads the current window location.
  reload() {
    window.location.reload();
  }

  openLoadingDilaogbox() {
    this.dialogRef = this.dialogService.open(this.loadingDialog, {
      closeOnBackdropClick: false,
      closeOnEsc: false,
      hasScroll: false,
    });
  }

  closeLoadingDialogBox() {
    if (this.dialogRef) this.dialogRef.close();
  }
}
