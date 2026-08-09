import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TriggerDeploymentDto {
  @ApiProperty({ example: 'main' })
  @IsString()
  @IsNotEmpty()
  branch: string;

  @ApiProperty({ example: 'a83f92d718bc32109e' })
  @IsString()
  @IsOptional()
  commitSha?: string;

  @ApiProperty({ example: 'v1.4.2' })
  @IsString()
  @IsOptional()
  version?: string;
}

export class RollbackDeploymentDto {
  @ApiProperty({ example: 'v1.4.1' })
  @IsString()
  @IsNotEmpty()
  targetVersion: string;
}
