import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'dev@deploymate.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'dev@deploymate.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '482910' })
  @IsString()
  @MinLength(6)
  otp: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'dev@deploymate.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '482910' })
  @IsString()
  @MinLength(6)
  otp: string;

  @ApiProperty({ example: 'NewSecurePassword123!' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'dev@deploymate.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Ayushman' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SecureP@ssw0rd!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '482910', required: false })
  @IsString()
  @IsOptional()
  otp?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'dev@deploymate.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecureP@ssw0rd!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
