import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { IFaq, IProductPrice, IPurchaseOrder } from '@commudle/shared-models';
import { AuthService, GoogleTagManagerService, ProductPriceService, SeoService } from '@commudle/shared-services';
import { NbDialogService } from '@commudle/theme';
import { faArrowDown, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { DarkModeService } from 'apps/commudle-admin/src/app/services/dark-mode.service';
import { FooterService } from 'apps/commudle-admin/src/app/services/footer.service';
import { staticAssets } from 'apps/commudle-admin/src/assets/static-assets';
import { LibErrorHandlerService } from 'apps/lib-error-handler/src/public-api';
import { ECmsType } from 'apps/shared-models/enums/cms.enum';
import { IPricing, IPricingFeatures } from 'apps/shared-models/pricing-features.model';
import { CmsService } from 'apps/shared-services/cms.service';
import { Subject, takeUntil } from 'rxjs';
@Component({
  selector: 'commudle-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss'],
})
export class PricingComponent implements OnInit, OnDestroy {
  @ViewChild('loadingTemplate') loadingTemplate: TemplateRef<any>;

  staticAssets = staticAssets;
  isMobileView = false;
  isDarkMode = false;
  enterprise: IPricing;
  startup: IPricing;
  devrel: IPricing;
  isMonthly = false;
  isAnnually = true;
  pricingFeatures: IPricingFeatures[] = [];
  showAllFeatures = true;
  ECmsType = ECmsType;
  faqs: IFaq[] = [];
  isFullPageLoading = false;

  existingCommunities: { image: string; name: string; slug: string; description: string }[];

  readonly icons = {
    faCircleCheck,
    faArrowDown,
    faCircleXmark,
  };
  private destroy$ = new Subject<void>();

  constructor(
    private seoService: SeoService,
    private gtm: GoogleTagManagerService,
    private footerService: FooterService,
    private darkModeService: DarkModeService,
    private cmsService: CmsService,
    private productPriceService: ProductPriceService,
    private nbDialogService: NbDialogService,
    private errorHandler: LibErrorHandlerService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.setExistingCommunities();
    this.getPricingDetails();
    this.setFaqs();
    this.setTags();
    this.isMobileView = window.innerWidth <= 1024;
    this.showAllFeatures = !this.isMobileView;
    this.footerService.changeFooterStatus(true);
    this.darkModeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isDarkMode) => (this.isDarkMode = isDarkMode));
  }

  ngOnDestroy(): void {
    this.footerService.changeFooterStatus(false);
    this.destroy$.next();
    this.destroy$.complete();
  }

  gtmDataLayerPush(event) {
    this.gtm.dataLayerPushEvent('click-pricing-plan', { com_plan_type: event });
  }

  getUseCaseCardsUrl() {
    if (!this.isDarkMode) {
      if (this.isMobileView) {
        return "url('" + staticAssets.pricing_usecase_cards_mobile + "')";
      } else {
        return "url('" + staticAssets.pricing_usecase_cards_desktop + "')";
      }
    }
  }

  getCommunityLogoCardsUrl() {
    if (!this.isDarkMode) {
      if (this.isMobileView) {
        return "url('" + staticAssets.pricing_community_logo_mobile + "')";
      } else {
        return "url('" + staticAssets.pricing_community_logo_desktop + "')";
      }
    }
  }

  getPricingFeatures() {
    const fields = 'name, order, features';
    const order = 'order asc';
    this.cmsService.getDataByTypeFieldOrder(ECmsType.PRICING_PLAN_FEATURES, fields, order).subscribe((value) => {
      this.pricingFeatures = value;
    });
  }

  toggleSubscription(value) {
    this.isMonthly = value === 'monthly' ? true : false;
    this.isAnnually = value === 'annually' ? true : false;
  }

  toggleShowAllFeatures() {
    this.showAllFeatures = !this.showAllFeatures;
  }

  setSchema(planType) {
    const priceDetails = this.isMonthly ? planType.priceDetails[1] : planType.priceDetails[0];

    this.seoService.setSchema({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: planType.name,
      image: 'https://www.commudle.com/assets/images/commudle-logo-full.png',
      description: planType.description,
      brand: 'Commudle',
      offers: {
        '@type': 'Offer',
        url: 'https://www.commudle.com/pricing',
        price: priceDetails?.price_after_discount || priceDetails?.price,
        priceCurrency: priceDetails?.currencyType === 'USD' ? 'USD' : 'INR',
      },
    });
  }

  createPurchaseOrderForPrice(gtmPushEventName: string, planType: string) {
    this.gtmDataLayerPush(gtmPushEventName);
    let productUuid;

    switch (planType) {
      case 'startup': {
        productUuid = this.isMonthly ? this.startup.priceDetails[1].uuid : this.startup.priceDetails[0].uuid;
        break;
      }
      case 'enterprise': {
        productUuid = this.isMonthly ? this.enterprise.priceDetails[1].uuid : this.enterprise.priceDetails[0].uuid;
        break;
      }
      // Not needed for now
      // case 'devrel': {
      //   productUuid = this.isMonthly ? this.devrel.priceDetails[1].uuid : this.devrel.priceDetails[0].uuid;
      //   break;
      // }
    }

    // Show loading dialog
    this.isFullPageLoading = true;
    const dialogRef = this.nbDialogService.open(this.loadingTemplate, {
      hasBackdrop: true,
      closeOnBackdropClick: false,
      closeOnEsc: false,
      hasScroll: false,
      context: {},
    });

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      if (user) {
        if (productUuid) {
          this.productPriceService.createPurchaseOrder(productUuid).subscribe(
            (response: IPurchaseOrder) => {
              this.gtm.dataLayerPushEvent('community-subscription-po-created', {
                com_purchase_order: response.uuid,
                com_purchase_order_quantity: response.quantity,
                com_purchase_order_subscription_months: response.notes.subscription_months,
              });
              this.isFullPageLoading = false;
              if (response && response.uuid) {
                window.location.href = `/checkout/${response.uuid}`;
              }
            },
            (error) => {
              this.isFullPageLoading = false;
              console.error('Error creating purchase order:', error);
            },
          );
        }
      } else {
        this.isFullPageLoading = false;
        dialogRef.close();
        this.errorHandler.handleError(401, 'Login to apply');
      }
    });
  }

  private getPricingDetails(): void {
    this.getEnterpriseData();
    this.getStartupData();
    this.getDevrelData();
    this.getPricingFeatures();
  }

  private fetchPricingData(type: 'enterprise' | 'startup', slug: string): void {
    this.cmsService.getDataBySlug(slug).subscribe((value) => {
      this[type] = value;

      [0, 1].forEach((index) => {
        if (this[type].priceDetails[index]) {
          this.productPriceService
            .show(this[type].priceDetails[index].uuid)
            .subscribe((productPrice: IProductPrice) => {
              this[type].priceDetails[index].currencyType = productPrice.currency;
              this[type].priceDetails[index].price = productPrice.original_price;
              this[type].priceDetails[index].price_after_discount =
                productPrice.final_price - productPrice.original_price ? productPrice.final_price : null;
              this[type].priceDetails[index].discount_percentage = productPrice.discount_percentage;
              this[type].priceDetails[index].uuid = productPrice.uuid;
            });
        }
      });
    });
  }

  private getEnterpriseData(): void {
    this.fetchPricingData('enterprise', 'pp-commudle-for-enterprises');
  }

  private getStartupData(): void {
    this.fetchPricingData('startup', 'pp-commudle-for-startups');
  }

  private getDevrelData(): void {
    this.cmsService.getDataBySlug('pp-commudle-for-devrel-agencies').subscribe((value) => {
      this.devrel = value;
    });
  }

  private setFaqs() {
    this.faqs = [
      {
        question: 'Do I need to purchase any other platform when I setup a Community on Commudle?',
        answer:
          "We don't think so, the Developer Communities on Commudle are able to manage all their activities here.",
      },
      {
        question: 'How many Communities can I host on Commudle?',
        answer:
          "You can host your complete Developer Ecosystem with 100's of Communities on Commudle. We have an organization page too. You have access to all the data and stats you need.",
      },
      {
        question: "I'm looking to build a career in DevRel, how can Commudle be useful in that?",
        answer:
          "As a DevRel, it's important to have an experience of building and growing your own Developer Community. Some folks are at leading DevRel positions who started by building their own Community here.",
      },
      {
        question: 'I want to display activities from Commudle on my website, is it possible?',
        answer:
          "Yes! From Startup plan and upwards you get access to our API's which can be used to display summary of your communities' activities on your own web page.",
      },
      {
        question: 'Will you help me migrate from other platforms?',
        answer: "Yes! And it's very easy.",
      },
      {
        question: 'I lead a Design Community, is Commudle for me?',
        answer: 'Absolutely, a few Design Communities are already using Commudle.',
      },
      {
        question: 'Does Commudle support paid ticket events?',
        answer:
          'Yes, Commudle supports paid tickets in events. Community organizers can access this feature from their community admin dashboard.',
      },
      {
        question: 'What are the charges for payments received through payment gateway on Commudle?',
        answer:
          "We use Stripe which has standard payment rates for payments made through different countries defined on this link: https://stripe.com/en-in/pricing. Commudle charges a standard platform fee. Depending on the plan purchased by you this fee can be a part of the annual subscription as a business so that your community leaders don't have to pay for it.",
      },
      {
        question: 'Will I get access to new features which are rolled out after I pay for my subscription?',
        answer:
          "Yes, unless it's a premium feature, it will be a part of your existing subscription, we will notify you in advance.",
      },
      {
        question: 'Is Commudle the right platform for my global community members?',
        answer: 'Yes, our users extend across the world.',
      },
    ];
  }

  private setTags() {
    this.seoService.setTags(
      'Pricing - Community Subscriptions on Commudle',
      'Choose a pricing plan which is right for your developer community program. Plans include events, hackathons, newsletters, channels, forums etc. We also have a preferred partner network.',
      'https://commudle.com/assets/images/commudle-logo192.png',
    );
  }

  private setExistingCommunities() {
    this.existingCommunities = [
      {
        name: 'Google Developer Groups',
        slug: 'gdg',
        description:
          'GDG New Delhi, Noida, Cloud, Siliguri and many more communities from the Google Developers ecosystem.',
        image:
          'https://json.commudle.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbmNlIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--1931d8ac25e32d52949f7069bfa3ceaf01db6524/gdg_new_delhi.png',
      },
      {
        name: 'Women Who Code Delhi',
        slug: 'women who code',
        description:
          'WWC Delhi is the one of the largest and most active community of engineers for inspiring women in tech.',
        image:
          'https://json.commudle.com/rails/active_storage/blobs/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbmdlIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--0eea224f77b91c395fe673164ee631209119061b/women_who_code_delhi.jpg',
      },
      {
        name: 'Microsoft Learn Student Ambassador',
        slug: 'microsoft',
        description: 'From Student Partner Communities to Ambassador and MVP communities, a flourishing ecosystem.',
        image:
          "https://json.commudle.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBbTZ6IiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--4f526e73c5364dd74efad7dfba8608f1a0309395/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDRG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFKZUFXa0NYZ0U2QzJ4dllXUmxjbnNHT2dsd1lXZGxNQT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--1b54362eb80bd09837e5bde550bb5151f95283d3/Microsoft%20Learn%20Student%20Ambassadors'%20Chapter.png",
      },
      {
        name: 'Tensor Flow User Groups',
        slug: 'tensorflow',
        description: 'The most active machine learning communities in the world.',
        image:
          'https://json.commudle.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdEVPIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--19a346d2585fbd6fd86b2a193ede2a9be1d4c7b6/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDRG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFKZUFXa0NYZ0U2QzJ4dllXUmxjbnNHT2dsd1lXZGxNQT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--1b54362eb80bd09837e5bde550bb5151f95283d3/TF_FullColor_Stacked.png',
      },
      {
        name: 'Robotex India',
        slug: 'robotex',
        description: 'One of the largest robotics communities which is empowering students to build unique solutions',
        image:
          'https://json.commudle.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNU0yQVE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--bc2e10c5f6c0d0601d382add9cae31c7258fc941/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDRG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFKZUFXa0NYZ0U2QzJ4dllXUmxjbnNHT2dsd1lXZGxNQT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--1b54362eb80bd09837e5bde550bb5151f95283d3/Robotex_India.png',
      },
      {
        name: 'IEEE',
        slug: 'ieee',
        description: 'The largest communities of engineers across the world.',
        image:
          'https://json.commudle.com/rails/active_storage/representations/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBaE8vIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--05e1517a8137079260ec3f02571686337815a16e/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdDRG9MWm05eWJXRjBTU0lJY0c1bkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFKZUFXa0NYZ0U2QzJ4dllXUmxjbnNHT2dsd1lXZGxNQT09IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--1b54362eb80bd09837e5bde550bb5151f95283d3/IEEE%20JHSB%20logo%20colored.png',
      },
    ];
  }
}
