import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, CreateEnvVarDto } from './projects.dto';

@ApiTags('projects')
@Controller('api/v1/projects')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  async createProject(@Req() req: any, @Body() dto: CreateProjectDto) {
    const project = await this.projectsService.createProject(req.user.id, dto);
    return { success: true, data: project };
  }

  @Get()
  @ApiOperation({ summary: 'List user projects with latest deployment status' })
  async getUserProjects(@Req() req: any) {
    const projects = await this.projectsService.getUserProjects(req.user.id);
    return { success: true, data: projects };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project detail by ID' })
  async getProjectById(@Req() req: any, @Param('id') id: string) {
    const project = await this.projectsService.getProjectById(req.user.id, id);
    return { success: true, data: project };
  }

  @Post(':id/env')
  @ApiOperation({ summary: 'Add or update environment variable for project' })
  async addEnvVar(@Req() req: any, @Param('id') id: string, @Body() dto: CreateEnvVarDto) {
    await this.projectsService.addEnvVariable(req.user.id, id, dto);
    return { success: true, message: 'Environment variable stored securely' };
  }
}
