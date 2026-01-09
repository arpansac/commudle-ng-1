import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { SeoService } from '@commudle/shared-services';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { IFaq } from '@commudle/shared-models';
import { NbButtonModule } from '@commudle/theme';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCalendarPlus,
  faTicket,
  faQrcode,
  faSackDollar,
  faArrowRight,
  faBuildingColumns,
} from '@fortawesome/free-solid-svg-icons';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'commudle-page-paid-ticketing',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedComponentsModule, NbButtonModule, FontAwesomeModule, RouterModule],
  templateUrl: './page-paid-ticketing.component.html',
  styleUrls: ['./page-paid-ticketing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePaidTicketingComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // FontAwesome icons
  faCalendarPlus = faCalendarPlus;
  faTicket = faTicket;
  faQrcode = faQrcode;
  faSackDollar = faSackDollar;
  faArrowRight = faArrowRight;
  faBuildingColumns = faBuildingColumns;

  // Calculator properties
  ticketPrice = 100;
  paymentGatewayFee = '0.00';
  commudleFee = '0.00';
  razorpayFee = '0.00';
  totalFees = '0.00';
  youReceive = '0.00';

  // FAQ data
  faqs: IFaq[] = [
    {
      question: 'What is the fee if I am on a community subscription plan?',
      answer:
        'Standard payment gateway fee applies to all payments. There is no platform fee for enterprise plan subscribers.',
    },
    {
      question: 'When do I receive my payout?',
      answer:
        'For Razorpay, the payouts are processed in T+2 bank working days after your event concludes. More details are available on the website of the payment gateway.',
    },
    {
      question: 'Can I accept international payments?',
      answer:
        'Yes! You can accept payments from attendees worldwide from the countries supported by the payment gateway. Check this link for Razorpay (https://razorpay.com/docs/payments/international-payments). Payouts are made in INR to your Indian bank account.',
    },
    {
      question: 'Are there any setup fees?',
      answer: 'No setup fees, no monthly fees. You only pay when you sell tickets.',
    },
    {
      question: 'How do I offer refunds?',
      answer:
        'Refunds are managed outside the platform, you can choose to deduct a fee or do a complete refund as per your discretion.',
    },
    {
      question: 'What payment methods are supported?',
      answer: 'Credit cards, debit cards, UPI, net banking, and popular digital wallets.',
    },
    {
      question: 'Where all can I use paid ticketing?',
      answer: 'You can create and sell tickets in your community events. It comes integrated in your dashboard.',
    },
    {
      question: 'Can I create discount coupons also?',
      answer:
        'Yes, you can create discount coupons. These can be created per ticket, combined for tickets. Discount coupons can be limited by time, number of people who apply it, group ticketing discounts and can be either fixed amount or percentage discounts as well.',
    },
    {
      question: 'What is the turn around time for support requests?',
      answer:
        'Queries related to paid ticketing are considered as top priority and get resolved within 6 working hours. In case of any reconciliation or payments not reflecting on dashboard, they get resolved within 24 working hours.',
    },
    {
      question: 'Can I use multiple bank accounts with multiple tickets or communities?',
      answer:
        'Yes, you can link multiple bank accounts into your dashboard. You can use different accounts for each ticket.',
    },
    {
      question: 'Is there any limit on the number of tickets I can sell for my event?',
      answer: 'No, there is no limit, you can sell thousands of tickets for your events.',
    },
  ];

  constructor(private seoService: SeoService, private cdr: ChangeDetectorRef, private footerService: FooterService) {}

  ngOnInit(): void {
    this.setPageMeta();
    this.setFooterVisibility();
    this.calculateFees();
  }

  private setFooterVisibility(): void {
    // Show the large footer
    this.footerService.changeFooterStatus(true);
  }

  calculateFees(): void {
    const price = Number(this.ticketPrice) || 0;

    // Payment Gateway: 2% + 18% GST = 2.36%
    const paymentGatewayBase = price * 0.02;
    const paymentGatewayGST = paymentGatewayBase * 0.18;
    const paymentGatewayTotal = paymentGatewayBase + paymentGatewayGST;

    // Commudle: 1% + 18% GST = 1.18%
    const commudleBase = price * 0.01;
    const commudleGST = commudleBase * 0.18;
    const commudleTotal = commudleBase + commudleGST;

    // Remaining amount after payment gateway and Commudle fees
    const remaining = price - paymentGatewayTotal - commudleTotal;

    // Razorpay: 0.25% + 18% GST on remaining amount
    const razorpayBase = remaining * 0.0025;
    const razorpayGST = razorpayBase * 0.18;
    const razorpayTotal = razorpayBase + razorpayGST;

    // Total fees and final amount
    const totalFeesAmount = paymentGatewayTotal + commudleTotal + razorpayTotal;
    const youReceiveAmount = price - totalFeesAmount;

    // Update properties with formatted values
    this.paymentGatewayFee = paymentGatewayTotal.toFixed(2);
    this.commudleFee = commudleTotal.toFixed(2);
    this.razorpayFee = razorpayTotal.toFixed(2);
    this.totalFees = totalFeesAmount.toFixed(2);
    this.youReceive = youReceiveAmount.toFixed(2);

    // Trigger change detection
    this.cdr.markForCheck();
  }

  private setPageMeta(): void {
    // Set comprehensive SEO meta tags
    this.seoService.setTags(
      'Paid Ticketing - Seamless Event Registration & Payment Processing',
      "Streamline your event ticketing with Commudle's paid ticketing solution for events. Accept payments, create discount coupons, manage registrations & track attendance, all in one platform.",
      'https://commudle.com/assets/images/commudle-logo-192.png',
      'website',
    );

    // Set structured data for search engines
    this.seoService.setSchema({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Paid Ticketing',
      description:
        "Streamline your event ticketing with Commudle's paid ticketing solution. Accept payments, manage registrations, and track attendance all in one platform.",
      url: 'https://commudle.com/p/paid-ticketing',
      publisher: {
        '@type': 'Organization',
        name: 'Commudle',
        logo: {
          '@type': 'ImageObject',
          url: 'https://commudle.com/assets/images/commudle-logo-192.png',
        },
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
