import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty()
  organizationID: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;
}

export class UpdateOrganizationDto {
  @ApiProperty({ required: false })
  organizationID?: string;

  @ApiProperty()
  BIN: string;

  @ApiProperty()
  KaspiToken: string;
}
