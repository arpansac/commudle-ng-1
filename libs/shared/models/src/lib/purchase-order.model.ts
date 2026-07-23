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
  /** Stamped on the PO when it transitions to `paid`. Format: `CMDLE/26-27/001`. */
  invoice_number?: string;
  price: number;
  payment_gateway_fee: number;
  currency: string;
  tax_amount: number;
  tax_name?: string;
  tax_rate?: number;
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
    campaign: ICampaign;
    prorated_addon?: string;
    extra_communities?: string;
    user_subscription_id?: string;
    /**
     * GST breakdown for Indian orders. Business rule:
     * - Buyer in Delhi → `igst` (single 18% line).
     * - Buyer in any other Indian state → `cgst_sgst` (9% + 9% split).
     * Amounts are in paise, matching `tax_amount` and `amount_to_be_paid`.
     * Consumed by the checkout order summary to render per-component rows.
     */
    tax_breakdown?: {
      kind: 'cgst_sgst' | 'igst';
      components: { name: string; rate: number; amount: number }[];
    };
  };
  total_amount: number;
}

export enum EPurchaseOrderStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  PARTIAL_REFUND = 'partial_refund',
  FULL_REFUND = 'full_refund',
}
