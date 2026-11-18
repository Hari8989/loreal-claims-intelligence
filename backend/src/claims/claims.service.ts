import { Injectable } from '@nestjs/common';
import { AssessmentDecision } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  ASSESSMENT_PROMPT_VERSION,
  OpenAiAssessmentService,
} from './assessment/openai-assessment.service.js';
import type { ModelDecision } from './assessment/openai-assessment.service.js';
import type { AssessClaimDto } from './dto/assess-claim.dto.js';

const prismaDecision: Record<ModelDecision, AssessmentDecision> = {
  JUSTIFIED: AssessmentDecision.SUPPORTED,
  NOT_JUSTIFIED: AssessmentDecision.NOT_SUPPORTED,
  INCONCLUSIVE: AssessmentDecision.INCONCLUSIVE,
};

@Injectable()
export class ClaimsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assessmentEngine: OpenAiAssessmentService,
  ) {}

  async assessClaim(input: AssessClaimDto) {
    const { result, modelVersion } = await this.assessmentEngine.assess(input);

    const persisted = await this.prisma.$transaction(async (transaction) => {
      const claim =
        (await transaction.claim.findFirst({
          where: {
            productName: input.productName,
            category: input.productCategory,
            claimText: input.claimText,
          },
          orderBy: { createdAt: 'asc' },
        })) ??
        (await transaction.claim.create({
          data: {
            productName: input.productName,
            category: input.productCategory,
            claimText: input.claimText,
          },
        }));

      const assessment = await transaction.assessment.create({
        data: {
          claimId: claim.id,
          evidenceText: input.evidenceText,
          decision: prismaDecision[result.decision],
          confidenceScore: result.confidenceScore,
          reasoning: result.reasoning,
          limitations: JSON.stringify(result.limitations),
          modelVersion,
          promptVersion: ASSESSMENT_PROMPT_VERSION,
          humanReviewed: false,
        },
      });

      return { claim, assessment };
    });

    return {
      claimId: persisted.claim.id,
      assessmentId: persisted.assessment.id,
      decision: persisted.assessment.decision,
      confidenceScore: persisted.assessment.confidenceScore,
      reasoning: persisted.assessment.reasoning,
      limitations: result.limitations,
      modelVersion: persisted.assessment.modelVersion,
      promptVersion: persisted.assessment.promptVersion,
      humanReviewed: persisted.assessment.humanReviewed,
      humanReviewRequired: true,
      claimStatus: persisted.claim.status,
      notice:
        'AI assessment only. This result does not approve or authorize the product claim; human scientific and regulatory review is required.',
    };
  }
}
