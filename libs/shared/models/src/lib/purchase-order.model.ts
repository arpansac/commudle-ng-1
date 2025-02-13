import { IDiscountCode } from './discount-code.model';
import { ICampaign } from './campaign.model';
import { IUser } from './user.model';

export interface IPurchaseOrder {
  id: number;
  uuid: string;
  application_fee_amount: number;
  amount_to_be_paid: number;
  amount: number;
  payment_gateway_fee: number;
  currency: string;
  currency_symbol: string; //used only to display(not from backend model)
  tax_amount: number;
  orderable_type: string;
  orderable_id: number;
  discount_code_id: number;
  orderable: ICampaign;
  user: IUser;
  status: EPurchaseOrderStatus;
  discount_code: IDiscountCode;
}

export enum EPurchaseOrderStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIAL_REFUND = 'partial_refund',
  FULL_REFUND = 'full_refund',
}
