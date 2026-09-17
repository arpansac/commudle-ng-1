export interface ICertificateProgressTotals {
  recipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  blocked: number;
  skipped: number;
}

export interface ICertificateProgressRow {
  id: number;
  email: string;
  reason: string;
}

export interface ICertificateProgress {
  totals: ICertificateProgressTotals;
  blocked: ICertificateProgressRow[];
  skipped: ICertificateProgressRow[];
}
