export interface IPricingFeatures {
  name: string;
  features: IPricingFeature[];
}

export interface IPricingFeature {
  name: string;
  enterprise: boolean;
  startup: boolean;
  agency: boolean;
  custom_text_for_agency: string;
  custom_text_for_enterprise: string;
  custom_text_for_startup: string;
}

export interface IPricing {
  name: string;
  description: string;
  priceDetails: IPricingPlanByMonthlyYearly[];
  key_features: string[];
  button_text: string;
}

export interface IPricingPlanByMonthlyYearly {
  name: string;
  uuid: string;
  details: IPricingPlan[];
  price_after_discount?: number;
  price: number;
  discount_percentage?: number;
  currencyType: string;
  country: string;
}
export interface IPricingPlan {
  price_after_discount?: number;
  price: number;
  discount_percentage?: number;
  url: string;
  currencyType: string;
  country: string;
}
