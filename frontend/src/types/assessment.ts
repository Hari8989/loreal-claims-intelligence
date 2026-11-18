export type ApiDecision = 'SUPPORTED' | 'NOT_SUPPORTED' | 'INCONCLUSIVE';

export type DisplayDecision =
  | 'JUSTIFIED'
  | 'NOT_JUSTIFIED'
  | 'INCONCLUSIVE';

export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface AssessClaimRequest {
  productName: string;
  productCategory: string;
  claimText: string;
  evidenceText: string;
}

export interface AssessmentResponse {
  claimId: string;
  assessmentId: string;
  decision: ApiDecision;
  confidenceScore: number;
  reasoning: string;
  limitations: string[];
  modelVersion: string;
  promptVersion: string;
  humanReviewed: boolean;
  humanReviewRequired: boolean;
  claimStatus: ClaimStatus;
  notice: string;
}

export interface AssessmentFormValues extends AssessClaimRequest {}
