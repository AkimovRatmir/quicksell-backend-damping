import { ApiProperty } from '@nestjs/swagger';
import { AutoOrg } from './autocreateorg.shema';
import { Type } from 'class-transformer';
import { ValidateNested, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty({ required: false, example: 'admin' })
  role?: string;

  @ApiProperty({ type: () => AutoOrg, required: false }) // ✅ For Swagger
  @ValidateNested()
  @Type(() => AutoOrg)
  @IsOptional()
  autoOrg?: AutoOrg;
}

export class LoginDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
