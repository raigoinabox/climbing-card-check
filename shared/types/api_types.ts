export interface ClimberDto {
  success: true;
  id: string;
  name?: string;
  certificate: string;
  examTime: string;
  expiryTime: string;
  examiner: string | null;
}

export type CheckDto =
  | ClimberDto
  | { id: unknown; success: false; message: unknown };
