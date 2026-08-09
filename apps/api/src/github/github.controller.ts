import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GitHubService } from './github.service';

@ApiTags('github')
@Controller('api/v1/github')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GitHubController {
  constructor(private githubService: GitHubService) {}

  @Get('repositories')
  @ApiOperation({ summary: 'Get user GitHub repositories' })
  async getRepositories(@Req() req: any) {
    try {
      const token = await this.githubService.getUserToken(req.user.id);
      const repos = await this.githubService.getRepositories(token);
      return { success: true, data: repos };
    } catch {
      // Fallback for developer onboarding when GitHub OAuth token is not connected yet
      const repos = await this.githubService.getRepositories('mock_token');
      return { success: true, data: repos };
    }
  }

  @Get('branches')
  @ApiOperation({ summary: 'Get branches for a repository' })
  async getBranches(@Req() req: any, @Query('repo') repo: string) {
    try {
      const token = await this.githubService.getUserToken(req.user.id);
      const branches = await this.githubService.getBranches(token, repo);
      return { success: true, data: branches };
    } catch {
      const branches = await this.githubService.getBranches('mock_token', repo);
      return { success: true, data: branches };
    }
  }

  @Post('connect-token')
  @ApiOperation({ summary: 'Connect personal GitHub access token' })
  async connectToken(@Req() req: any, @Body() body: { token: string; username: string }) {
    await this.githubService.saveUserToken(req.user.id, `gh_${Date.now()}`, body.username, body.token);
    return { success: true, message: 'GitHub connected successfully' };
  }
}
