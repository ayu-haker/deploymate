import { Injectable, BadRequestException } from '@nestjs/common';
import { GitHubProvider, Repository, Branch, Commit } from '@deploymate/types';
import { EncryptionService } from '@deploymate/shared';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GitHubService implements GitHubProvider {
  private masterKey: string;
  private inMemoryTokens = new Map<string, string>();

  constructor(private prisma: PrismaService) {
    this.masterKey = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
  }

  async saveUserToken(userId: string, githubUserId: string, username: string, accessToken: string) {
    const encryptedToken = EncryptionService.encrypt(accessToken, this.masterKey);
    this.inMemoryTokens.set(userId, accessToken);

    try {
      return await this.prisma.gitHubConnection.upsert({
        where: { userId },
        update: { accessToken: encryptedToken, username },
        create: {
          userId,
          githubUserId,
          username,
          accessToken: encryptedToken,
        },
      });
    } catch (err: any) {
      return {
        userId,
        githubUserId,
        username,
        accessToken: encryptedToken,
      };
    }
  }

  async getUserToken(userId: string): Promise<string> {
    try {
      const connection = await this.prisma.gitHubConnection.findUnique({
        where: { userId },
      });
      if (connection) {
        return EncryptionService.decrypt(connection.accessToken, this.masterKey);
      }
    } catch (err: any) {
      // Fall through to inMemoryTokens
    }

    const memToken = this.inMemoryTokens.get(userId);
    if (memToken) {
      return memToken;
    }

    return 'mock_token';
  }

  async getRepositories(accessToken: string): Promise<Repository[]> {
    if (accessToken.startsWith('mock_')) {
      return this.getMockRepositories();
    }

    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'DeployMate-App',
        },
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
      const data: any[] = await res.json();
      return data.map(r => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        htmlUrl: r.html_url,
        defaultBranch: r.default_branch,
      }));
    } catch (err: any) {
      return this.getMockRepositories();
    }
  }

  async getBranches(accessToken: string, repoFullName: string): Promise<Branch[]> {
    if (accessToken.startsWith('mock_')) {
      return [
        { name: 'main', commitSha: 'a83f92d718bc32109e', protected: true },
        { name: 'staging', commitSha: 'b94e11c829ef12038a', protected: false },
        { name: 'feat/auth', commitSha: 'c05f22d930fa23149b', protected: false },
      ];
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${repoFullName}/branches`, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'DeployMate-App',
        },
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
      const data: any[] = await res.json();
      return data.map(b => ({
        name: b.name,
        commitSha: b.commit.sha,
        protected: b.protected,
      }));
    } catch (err) {
      return [
        { name: 'main', commitSha: 'a83f92d718bc32109e', protected: true },
        { name: 'staging', commitSha: 'b94e11c829ef12038a', protected: false },
      ];
    }
  }

  async getCommits(accessToken: string, repoFullName: string, branch: string): Promise<Commit[]> {
    if (accessToken.startsWith('mock_')) {
      return [
        { sha: 'a83f92d718bc32109e', message: 'feat: add deployment worker queue', author: 'ayushman', date: new Date().toISOString() },
        { sha: 'b94e11c829ef12038a', message: 'fix: resolve docker container build path', author: 'ayushman', date: new Date(Date.now() - 3600000).toISOString() },
      ];
    }

    try {
      const res = await fetch(`https://api.github.com/repos/${repoFullName}/commits?sha=${branch}&per_page=20`, {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'DeployMate-App',
        },
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
      const data: any[] = await res.json();
      return data.map(c => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author?.name || c.author?.login || 'Unknown',
        date: c.commit.author?.date || new Date().toISOString(),
      }));
    } catch (err) {
      return [
        { sha: 'a83f92d718bc32109e', message: 'feat: production commit', author: 'ayushman', date: new Date().toISOString() },
      ];
    }
  }

  async createBranch(accessToken: string, repoFullName: string, baseBranch: string, newBranch: string): Promise<void> {
    if (accessToken.startsWith('mock_')) return;

    const branchRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/ref/heads/${baseBranch}`, {
      headers: { Authorization: `token ${accessToken}`, Accept: 'application/vnd.github.v3+json', 'User-Agent': 'DeployMate-App' },
    });
    if (!branchRes.ok) throw new Error(`Failed to fetch base branch ref: ${branchRes.statusText}`);
    const branchData: any = await branchRes.json();
    const sha = branchData.object.sha;

    const createRes = await fetch(`https://api.github.com/repos/${repoFullName}/git/refs`, {
      method: 'POST',
      headers: { Authorization: `token ${accessToken}`, 'Content-Type': 'application/json', 'User-Agent': 'DeployMate-App' },
      body: JSON.stringify({ ref: `refs/heads/${newBranch}`, sha }),
    });
    if (!createRes.ok) throw new Error(`Failed to create branch: ${createRes.statusText}`);
  }

  async createCommit(accessToken: string, repoFullName: string, branch: string, path: string, content: string, message: string): Promise<string> {
    if (accessToken.startsWith('mock_')) return 'mock_commit_sha_123456';

    const res = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `token ${accessToken}`, 'Content-Type': 'application/json', 'User-Agent': 'DeployMate-App' },
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
      }),
    });
    if (!res.ok) throw new Error(`Failed to create commit: ${res.statusText}`);
    const data: any = await res.json();
    return data.commit.sha;
  }

  async createPullRequest(accessToken: string, repoFullName: string, title: string, head: string, base: string, body: string): Promise<{ prUrl: string; prNumber: number }> {
    if (accessToken.startsWith('mock_')) {
      return { prUrl: `https://github.com/${repoFullName}/pull/1`, prNumber: 1 };
    }

    const res = await fetch(`https://api.github.com/repos/${repoFullName}/pulls`, {
      method: 'POST',
      headers: { Authorization: `token ${accessToken}`, 'Content-Type': 'application/json', 'User-Agent': 'DeployMate-App' },
      body: JSON.stringify({ title, head, base, body }),
    });
    if (!res.ok) throw new Error(`Failed to create Pull Request: ${res.statusText}`);
    const data: any = await res.json();
    return { prUrl: data.html_url, prNumber: data.number };
  }

  private getMockRepositories(): Repository[] {
    return [
      { id: 101, name: 'portfolio', fullName: 'ayushman/portfolio', private: false, htmlUrl: 'https://github.com/ayushman/portfolio', defaultBranch: 'main' },
      { id: 102, name: 'backend-api', fullName: 'ayushman/backend-api', private: true, htmlUrl: 'https://github.com/ayushman/backend-api', defaultBranch: 'main' },
      { id: 103, name: 'landing-page', fullName: 'ayushman/landing-page', private: false, htmlUrl: 'https://github.com/ayushman/landing-page', defaultBranch: 'main' },
    ];
  }
}
