export type CertificateState = "punane" | "roheline" | "none" | "unknown";

export interface ExamClimberDto {
  name: string;
  idCode: string;
  foreigner: boolean;
  email: string;
  comment: string;
}

export interface ExamDto {
  examDate: string | null;
  examType: "roheline" | "punane";
  climbers: ExamClimberDto[];
}

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
