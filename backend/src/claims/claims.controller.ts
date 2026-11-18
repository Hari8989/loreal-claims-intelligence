import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AssessClaimDto } from './dto/assess-claim.dto.js';
import { ClaimsService } from './claims.service.js';

@Controller('api/claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post('assess')
  @HttpCode(HttpStatus.CREATED)
  assess(@Body() input: AssessClaimDto) {
    return this.claimsService.assessClaim(input);
  }
}
