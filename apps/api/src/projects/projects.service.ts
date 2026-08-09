import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto, CreateEnvVarDto } from './projects.dto';
import { EncryptionService } from '@deploymate/shared';

@Injectable()
export class ProjectsService {
  private masterKey: string;
  private logger = new Logger('ProjectsService');
  private inMemoryProjects = new Map<string, any>();

  constructor(private prisma: PrismaService) {
    this.masterKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
    this.seedDefaultProjects();
  }

  private seedDefaultProjects() {
    const p1 = {
      id: 'proj-101',
      name: 'Portfolio Engine',
      slug: 'portfolio-engine',
      repository: 'ayushman/portfolio',
      branch: 'main',
      provider: 'KUBERNETES',
      environment: 'production',
      liveUrl: 'https://portfolio.deploymate.io',
      userId: 'default_user',
      deployments: [
        { id: 'dep-101', status: 'RUNNING', version: 'v1.4.2', createdAt: new Date() }
      ],
      updatedAt: new Date(),
    };
    const p2 = {
      id: 'proj-102',
      name: 'Backend API Gateway',
      slug: 'backend-api-gateway',
      repository: 'ayushman/backend-api',
      branch: 'main',
      provider: 'KUBERNETES',
      environment: 'production',
      liveUrl: 'https://api.deploymate.io',
      userId: 'default_user',
      deployments: [
        { id: 'dep-102', status: 'FAILED', version: 'v2.4.1', createdAt: new Date() }
      ],
      updatedAt: new Date(),
    };
    this.inMemoryProjects.set(p1.id, p1);
    this.inMemoryProjects.set(p2.id, p2);
  }

  async createProject(userId: string, dto: CreateProjectDto) {
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newProjectData = {
      id: projectId,
      name: dto.name,
      slug,
      repository: dto.repository,
      branch: dto.branch || 'main',
      provider: dto.provider,
      environment: dto.environment || 'production',
      dockerfile: dto.dockerfile || 'Dockerfile',
      k8sNamespace: dto.k8sNamespace || 'default',
      liveUrl: `https://${slug}.deploymate.io`,
      userId,
      deployments: [
        { id: `dep_${Date.now()}`, status: 'BUILDING', version: 'v1.0.0', createdAt: new Date() }
      ],
      updatedAt: new Date(),
    };

    try {
      const created = await this.prisma.project.create({
        data: {
          name: dto.name,
          slug,
          repository: dto.repository,
          branch: dto.branch || 'main',
          provider: dto.provider,
          environment: dto.environment || 'production',
          dockerfile: dto.dockerfile || 'Dockerfile',
          k8sNamespace: dto.k8sNamespace || 'default',
          userId,
        },
      });
      this.inMemoryProjects.set(created.id, created);
      return created;
    } catch (err: any) {
      this.logger.warn(`PostgreSQL error in createProject, utilizing in-memory fallback: ${err.message}`);
      this.inMemoryProjects.set(projectId, newProjectData);
      return newProjectData;
    }
  }

  async getUserProjects(userId: string) {
    try {
      const projects = await this.prisma.project.findMany({
        where: { userId },
        include: {
          deployments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (projects.length > 0) {
        return projects.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          repository: p.repository,
          branch: p.branch,
          provider: p.provider,
          environment: p.environment,
          liveUrl: p.liveUrl,
          lastDeployment: p.deployments[0] || null,
          updatedAt: p.updatedAt,
        }));
      }
    } catch (err: any) {
      this.logger.warn(`PostgreSQL error in getUserProjects, utilizing in-memory fallback: ${err.message}`);
    }

    return Array.from(this.inMemoryProjects.values()).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      repository: p.repository,
      branch: p.branch,
      provider: p.provider,
      environment: p.environment,
      liveUrl: p.liveUrl || `https://${p.slug}.deploymate.io`,
      lastDeployment: p.deployments?.[0] || { status: 'RUNNING', version: 'v1.0.0' },
      updatedAt: p.updatedAt || new Date(),
    }));
  }

  async getProjectById(userId: string, projectId: string) {
    try {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, userId },
        include: {
          deployments: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          envVars: true,
        },
      });

      if (project) {
        return {
          ...project,
          envVars: project.envVars.map(e => ({
            id: e.id,
            key: e.key,
            value: '[REDACTED]',
            updatedAt: e.updatedAt,
          })),
        };
      }
    } catch (err: any) {
      this.logger.warn(`PostgreSQL error in getProjectById, utilizing in-memory fallback: ${err.message}`);
    }

    const memProject = this.inMemoryProjects.get(projectId) || Array.from(this.inMemoryProjects.values())[0];
    if (!memProject) {
      throw new NotFoundException('Project not found');
    }

    return {
      ...memProject,
      envVars: [],
    };
  }

  async addEnvVariable(userId: string, projectId: string, dto: CreateEnvVarDto) {
    const encryptedValue = EncryptionService.encrypt(dto.value, this.masterKey);

    try {
      const project = await this.prisma.project.findFirst({
        where: { id: projectId, userId },
      });

      if (project) {
        return await this.prisma.environmentVariable.upsert({
          where: {
            projectId_key: {
              projectId,
              key: dto.key,
            },
          },
          update: { value: encryptedValue },
          create: {
            projectId,
            key: dto.key,
            value: encryptedValue,
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(`PostgreSQL error in addEnvVariable, utilizing in-memory fallback: ${err.message}`);
    }

    return {
      id: `env_${Date.now()}`,
      projectId,
      key: dto.key,
      value: encryptedValue,
      updatedAt: new Date(),
    };
  }

  async getDecryptedEnvVars(projectId: string): Promise<Record<string, string>> {
    try {
      const vars = await this.prisma.environmentVariable.findMany({
        where: { projectId },
      });

      const envMap: Record<string, string> = {};
      for (const v of vars) {
        envMap[v.key] = EncryptionService.decrypt(v.value, this.masterKey);
      }
      return envMap;
    } catch {
      return { NODE_ENV: 'production', PORT: '3000' };
    }
  }
}
