import { ICertificateDesign } from './certificate-design.model';

export enum ECertificateBatchStatus {
  DRAFT = 0,
  READY = 1,
  SENDING = 2,
  SENT = 3,
}

export interface ICertificateBatch {
  id: number;
  name: string;
  uuid: string;
  status: ECertificateBatchStatus;
  locked_at: string | null;
  revoked_at: string | null;
  consent_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  recipients_count: number;
  sent_count: number;
  blocked_count: number;
  certificate_design_id: number | null;
  email_subject?: string | null;
  email_body?: string | null;
  issuer_type?: string;
  issuer_id?: number;
  design?: ICertificateDesign | null;
}

export interface ICertificateBatchesIndexResponse {
  certificate_batches: ICertificateBatch[];
  page: number;
  count: number;
  total: number;
}
