import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DeploymentsService } from './deployments.service';
import { TriggerDeploymentDto, RollbackDeploymentDto } from './deployments.dto';

@ApiTags('deployments')
@Controller('api/v1/deployments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DeploymentsController {
  constructor(private deploymentsService: DeploymentsService) {}

  @Post('project/:projectId')
  @ApiOperation({ summary: 'Trigger a new deployment for a project' })
  async triggerDeployment(
    @Req() req: any,
    @Param('projectId') projectId: string,
    @Body() dto: TriggerDeploymentDto,
  ) {
    const deployment = await this.deploymentsService.triggerDeployment(req.user.id, projectId, dto);
    return { success: true, data: deployment };
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List recent deployments for a project' })
  async getProjectDeployments(@Req() req: any, @Param('projectId') projectId: string) {
    const deployments = await this.deploymentsService.getDeploymentsByProject(req.user.id, projectId);
    return { success: true, data: deployments };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get deployment details, real-time logs, and events' })
  async getDeploymentById(@Req() req: any, @Param('id') id: string) {
    const deployment = await this.deploymentsService.getDeploymentById(req.user.id, id);
    return { success: true, data: deployment };
  }

  @Post(':id/rollback')
  @ApiOperation({ summary: 'Trigger safe deployment rollback to target version' })
  async rollbackDeployment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: RollbackDeploymentDto,
  ) {
    const rollback = await this.deploymentsService.rollbackDeployment(req.user.id, id, dto);
    return { success: true, data: rollback };
  }
}
