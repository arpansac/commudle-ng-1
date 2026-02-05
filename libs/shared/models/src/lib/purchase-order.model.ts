import { IDiscountCode } from './discount-code.model';
import { ICampaign } from './campaign.model';
import { IUser } from './user.model';
import { IRazorpayOrder } from './razorpay-order.model';
import { IContactInfo } from './contact-info.model';
import { EDbModels } from './db-models.enum';

export interface IPurchaseOrder {
  id: number;
  uuid: string;
  application_fee_amount: number;
  amount_to_be_paid: number;
  amount: number;
  payment_gateway_fee: number;
  currency: string;
  tax_amount: number;
  orderable_type: EDbModels;
  orderable_id: number;
  discount_code_id: number;
  base_amount: number;
  base_currency: string;
  orderable: ICampaign;
  user: IUser;
  status: EPurchaseOrderStatus;
  discount_code: IDiscountCode;
  created_at: Date;
  razorpay_order?: IRazorpayOrder;
  quantity: number;
  contact_info: IContactInfo;
  notes: {
    subscription_months: number;
  };
  discount_amount: number;
  has_taxes: boolean;
  price: number;
  tax_name: string;
  tax_rate: number;
  total_amount: number;
  updated_at: Date;
  user_id: number;
}

export enum EPurchaseOrderStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIAL_REFUND = 'partial_refund',
  FULL_REFUND = 'full_refund',
}
