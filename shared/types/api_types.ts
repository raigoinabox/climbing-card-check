export type CertificateState = "punane" | "roheline" | "none" | "unknown";

export interface ClimberDto {
  id: string;
  name?: string;
  certificate: CertificateState;
  examTime: string;
  expiryTime: string;
  examiner: string | null;
}

export interface CardClimberDto extends ClimberDto {
  cardSerialId: string | undefined;
}
