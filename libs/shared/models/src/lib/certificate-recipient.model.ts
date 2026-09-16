export enum ECertificateRecipientSource {
  CSV = 0,
  MANUAL = 1,
}

export enum ECertificateRecipientStatus {
  PENDING = 0,
  QUEUED = 1,
  GENERATED = 2,
  SENT = 3,
  DELIVERED = 4,
  BOUNCED = 5,
  FAILED = 6,
  SKIPPED = 7,
  BLOCKED = 8,
}

export interface ICertificateRecipientDelivery {
  id: number;
  fixed_email_id: number;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  delivered_at: string | null;
  opens: number;
  clicks: number;
}

export interface ICertificateRecipient {
  id: number;
  certificate_batch_id?: number;
  email: string;
  name: string | null;
  source: ECertificateRecipientSource;
  status: ECertificateRecipientStatus;
  skip_reason: string | null;
  revoked_at: string | null;
  generated_at?: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  last_error?: string | null;
  send_count: number;
  row_values: { [key: string]: string };
  resolved_values?: { [key: string]: string };
  uuid: string;
  user_id: number | null;
  missing_required_keys?: string[];
  sendable?: boolean;
  pdf_url?: string | null;
  deliveries?: ICertificateRecipientDelivery[];
}

export interface ICertificateRecipientsIndexResponse {
  certificate_recipients: ICertificateRecipient[];
  page: number;
  count: number;
  total: number;
}
