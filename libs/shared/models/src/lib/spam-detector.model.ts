export interface ISpamDetector {
  id: number;
  request_sent_at: string;
  response_received_at: string;
  is_spam: boolean;
  score: number;
  is_spam_decision: boolean;
  created_at: string;
  updated_at: string;
  content_type: string;
  content_id: number;
}
