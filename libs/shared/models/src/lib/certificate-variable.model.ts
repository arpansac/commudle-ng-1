export enum ECertificateVariableSource {
  CSV_HEADER = 0,
  MANUAL = 1,
}

export interface ICertificateVariableTextStyle {
  font?: string;
  size?: number;
  color?: string;
  weight?: 'normal' | 'bold';
  style?: 'normal' | 'italic';
  align?: 'left' | 'center' | 'right';
}

export interface ICertificateVariablePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ICertificateVariable {
  id: number;
  certificate_batch_id: number;
  key: string;
  label: string;
  default_value: string | null;
  source: ECertificateVariableSource;
  keep: boolean;
  positions: ICertificateVariablePosition | null;
  text_style: ICertificateVariableTextStyle | null;
  default_set: boolean;
  positioned: boolean;
}

export interface ICertificateVariablesIndexResponse {
  certificate_variables: ICertificateVariable[];
}
