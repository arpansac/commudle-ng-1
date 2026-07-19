import { EDbModels } from './db-models.enum';
import { IUser } from './user.model';

export interface IDiscountCode {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  is_limited: boolean;
  event_data_form_entity_group_ids: [];
  expires_at: Date;
  max_limit: number;
  user: IUser;
  min_users_count: number;
  max_users_count: number;
  /**
   * Per-user usage cap. `null` / `0` = unlimited (lifetime — applies to first purchase
   * and every renewal / add-on). `N` = up to N paid POs by the same user can use it.
   */
  max_applications_per_user?: number | null;
  discount_applied_count: number;
  discount_used_count: number;
  object_type: EDbModels;
}

export enum EDiscountType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percent',
}
