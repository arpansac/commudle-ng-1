import { IUser } from 'apps/shared-models/user.model';
export interface IFixedEmail {
  id: number;
  subject: string;
  message: string;
  created_at: Date;
  mail_type: string;
  emails_count: number;
  user: IUser;
  email_total_stats: EmailTotalStats;
  recipients_count: number;
}

export interface EmailTotalStats {
  open: number;
  click: number;
  bounced: number;
  dropped: number;
  deferred: number;
  delivered: number;
  opened_at: any;
  processed: number;
  clicked_at: any;
  spam_report: number;
  unsubscribe: number;
  delivered_at: any;
  unique_opens: number;
  unique_clicks: number;
  group_unsubscribe: number;
}
