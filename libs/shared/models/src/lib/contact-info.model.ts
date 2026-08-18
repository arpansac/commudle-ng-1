export interface IContactInfo {
  id: number;
  email: string;
  country_code: string;
  phone_number: number;
  twitter: string;
  facebook: string;
  instagram: string;
  linkedIn: string;
  discord: string;
  slack: string;
  github: string;
  website: string;
  address: Address;
  tax_info: TaxInfo;
}

export interface Address {
  address: string;
  pin_code: string;
  company_name: string;
  /** State / region — required when the billing country is India, empty otherwise. */
  state?: string;
  /** Billing contact person's full name — collected in the checkout billing form. */
  contact_person_name?: string;
  /** Billing contact email — collected in the checkout billing form. */
  contact_email?: string;
  /** Billing contact phone — collected in the checkout billing form. */
  contact_phone?: string;
}

export interface TaxInfo {
  gst: string;
  pan_card: string;
}
