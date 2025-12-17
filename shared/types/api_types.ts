export type CertificateState = "red" | "green" | "none" | "unknown";

export interface ClimberDto {
  id: string;
  name?: string;
  certificate: CertificateState | "expired";
  examTime: string;
  expiryTime: string;
  examiner: string | null;
}

export interface CardClimberDto extends ClimberDto {
  cardSerialId: string | undefined;
}
