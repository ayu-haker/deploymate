import { Controller, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AIService } from './ai.service';

@ApiTags('ai')
@Controller('api/v1/ai')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AIController {
  constructor(private aiService: AIService) {}

  @Post('diagnose/:deploymentId')
  @ApiOperation({ summary: 'Trigger AI root-cause analysis on a failed deployment' })
  async diagnoseDeployment(@Req() req: any, @Param('deploymentId') deploymentId: string) {
    const result = await this.aiService.diagnoseDeployment(req.user.id, deploymentId);
    return { success: true, data: result };
  }

  @Post('fix/:fixId/approve')
  @ApiOperation({ summary: 'Approve and execute proposed AI fix (create PR or update config)' })
  async approveFix(@Req() req: any, @Param('fixId') fixId: string) {
    const result = await this.aiService.approveFix(req.user.id, fixId);
    return { success: true, data: result };
  }
}
