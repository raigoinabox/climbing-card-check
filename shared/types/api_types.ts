export type CertificateState = "punane" | "roheline";

export interface ExamClimberDto {
  name: string;
  idCode: string;
  foreigner: boolean;
  email: string;
  comment: string;
}

export interface ExamDto {
  paid: boolean;
  examinerName: string;
  examDate: string;
  examType: "roheline" | "punane";
  climbers: ExamClimberDto[];
}

export interface ClimberDto {
  id?: string;
  name?: string;
  certificate: CertificateState | "expired";
  examTime: string;
  expiryTime?: string;
  examiner: string | null;
}

export interface CardClimberDto extends ClimberDto {
  cardSerialId: string | undefined;
}
