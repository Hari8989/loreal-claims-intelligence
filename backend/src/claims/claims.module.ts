import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ClaimsController } from './claims.controller.js';
import { ClaimsService } from './claims.service.js';
import { OpenAiAssessmentService } from './assessment/openai-assessment.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [ClaimsController],
  providers: [ClaimsService, OpenAiAssessmentService],
})
export class ClaimsModule {}
