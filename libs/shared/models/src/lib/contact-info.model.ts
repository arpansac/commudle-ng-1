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
}

export interface TaxInfo {
  gst: string;
}
