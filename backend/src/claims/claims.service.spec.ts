import { AssessmentDecision, ClaimStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClaimsService } from './claims.service.js';
import { ASSESSMENT_PROMPT_VERSION } from './assessment/openai-assessment.service.js';
import type { ModelDecision } from './assessment/openai-assessment.service.js';
import type { AssessClaimDto } from './dto/assess-claim.dto.js';

const input: AssessClaimDto = {
  productName: 'Hydration Serum',
  productCategory: 'Skincare',
  claimText: 'Improves skin hydration',
  evidenceText: 'Hydration was measured before and after product use.',
};

const existingClaim = {
  id: 'claim-1',
  productName: input.productName,
  category: input.productCategory,
  claimText: input.claimText,
  status: ClaimStatus.DRAFT,
};

const modelAssessment = (decision: ModelDecision) => ({
  result: {
    decision,
    confidenceScore: 82,
    reasoning: 'The evidence directly measured the claimed outcome.',
    limitations: ['The duration is not provided.'],
  },
  modelVersion: 'test-model',
});

describe('ClaimsService', () => {
  let service: ClaimsService;
  let transaction: {
    claim: {
      findFirst: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
    };
    assessment: { create: ReturnType<typeof vi.fn> };
  };
  let prisma: { $transaction: ReturnType<typeof vi.fn> };
  let assessmentEngine: { assess: ReturnType<typeof vi.fn> };
  let retainedAssessments: Array<Record<string, unknown>>;

  beforeEach(() => {
    retainedAssessments = [];
    transaction = {
      claim: {
        findFirst: vi.fn().mockResolvedValue(existingClaim),
        create: vi.fn().mockResolvedValue(existingClaim),
      },
      assessment: {
        create: vi.fn().mockImplementation(async ({ data }) => {
          const assessment = {
            id: `assessment-${retainedAssessments.length + 1}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          retainedAssessments.push(assessment);
          return assessment;
        }),
      },
    };
    prisma = {
      $transaction: vi.fn((operation) => operation(transaction)),
    };
    assessmentEngine = {
      assess: vi.fn().mockResolvedValue(modelAssessment('JUSTIFIED')),
    };
    service = new ClaimsService(
      prisma as unknown as PrismaService,
      assessmentEngine as never,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['JUSTIFIED', AssessmentDecision.SUPPORTED],
    ['NOT_JUSTIFIED', AssessmentDecision.NOT_SUPPORTED],
    ['INCONCLUSIVE', AssessmentDecision.INCONCLUSIVE],
  ] as const)(
    'maps %s to the existing Prisma enum %s',
    async (modelDecision, prismaDecision) => {
      assessmentEngine.assess.mockResolvedValueOnce(
        modelAssessment(modelDecision),
      );

      const response = await service.assessClaim(input);

      expect(transaction.assessment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          decision: prismaDecision,
          evidenceText: input.evidenceText,
          confidenceScore: 82,
          limitations: JSON.stringify(['The duration is not provided.']),
          modelVersion: 'test-model',
          promptVersion: ASSESSMENT_PROMPT_VERSION,
          humanReviewed: false,
        }),
      });
      expect(response.decision).toBe(prismaDecision);
    },
  );

  it('reuses a matching claim and retains one new assessment for each evaluation', async () => {
    const first = await service.assessClaim(input);
    const second = await service.assessClaim({
      ...input,
      evidenceText: 'A second evidence submission.',
    });

    expect(first.claimId).toBe(existingClaim.id);
    expect(second.claimId).toBe(existingClaim.id);
    expect(first.assessmentId).not.toBe(second.assessmentId);
    expect(transaction.claim.findFirst).toHaveBeenCalledTimes(2);
    expect(transaction.claim.create).not.toHaveBeenCalled();
    expect(retainedAssessments).toHaveLength(2);
    expect(retainedAssessments.map((assessment) => assessment.evidenceText)).toEqual([
      input.evidenceText,
      'A second evidence submission.',
    ]);
  });

  it('creates a claim when no matching claim exists', async () => {
    transaction.claim.findFirst.mockResolvedValueOnce(null);

    await service.assessClaim(input);

    expect(transaction.claim.create).toHaveBeenCalledWith({
      data: {
        productName: input.productName,
        category: input.productCategory,
        claimText: input.claimText,
      },
    });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('propagates a database transaction failure without returning a partial result', async () => {
    const databaseFailure = new Error('simulated transaction failure');
    transaction.assessment.create.mockRejectedValueOnce(databaseFailure);

    await expect(service.assessClaim(input)).rejects.toBe(databaseFailure);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
