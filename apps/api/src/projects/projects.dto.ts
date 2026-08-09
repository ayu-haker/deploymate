import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProviderType } from '@deploymate/types';

export class CreateProjectDto {
  @ApiProperty({ example: 'Backend API' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ayushman/backend-api' })
  @IsString()
  @IsNotEmpty()
  repository: string;

  @ApiProperty({ example: 'main', default: 'main' })
  @IsString()
  @IsNotEmpty()
  branch: string;

  @ApiProperty({ enum: ProviderType, example: ProviderType.KUBERNETES })
  @IsEnum(ProviderType)
  provider: ProviderType;

  @ApiProperty({ example: 'production', default: 'production' })
  @IsString()
  @IsOptional()
  environment?: string;

  @ApiProperty({ example: 'Dockerfile' })
  @IsString()
  @IsOptional()
  dockerfile?: string;

  @ApiProperty({ example: 'deploymate-prod' })
  @IsString()
  @IsOptional()
  k8sNamespace?: string;
}

export class CreateEnvVarDto {
  @ApiProperty({ example: 'DATABASE_URL' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ example: 'postgresql://usr:pwd@host:5432/db' })
  @IsString()
  @IsNotEmpty()
  value: string;
}
