// src/services/kycService.ts
import { KYCStatus, DocumentType } from "@/types";

type VerifyKYCInput = {
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  file: File;
};

type VerifyKYCResult = {
  status: KYCStatus;
  confidenceScore: number;
};

export function verifyKYC(data: VerifyKYCInput): Promise<VerifyKYCResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: KYCStatus.APPROVED, confidenceScore: 96 });
    }, 1200);
  });
}
