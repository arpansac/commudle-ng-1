export enum ECertificateDesignType {
  PRESET = 0,
  CUSTOM = 1,
}

export interface ICertificateDesign {
  id: number;
  name: string;
  design_type: ECertificateDesignType;
  image_width: number;
  image_height: number;
  archived_at: string | null;
  locked_at: string | null;
  background_image_url?: string;
  created_at?: string;
  updated_at?: string;
  is_preset?: boolean;
  background_image?: { id: number; url: string } | null;
}

export interface ICertificateDesignsIndexResponse {
  certificate_designs: ICertificateDesign[];
}
