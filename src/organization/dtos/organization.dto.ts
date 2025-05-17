import { ApiProperty } from '@nestjs/swagger';

export class CreateOrganizationDto {
  @ApiProperty()
  organizationID: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class UpdateOrganizationDto {
  // @ApiProperty()
  // BIN: string;

  @ApiProperty()
  KaspiToken: string;

  @ApiProperty()
  isPaid: string;

  @ApiProperty()
  capacity: number;

  @ApiProperty()
  isOn: string;

  @ApiProperty({ required: false })
  isOnDemo?: string;

  @ApiProperty({ required: false })
  stepGlob?: number;

  @ApiProperty({ required: false })
  minPriceGlob?: number;

  @ApiProperty({ required: false })
  maxPriceGlob?: number;


}
