import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ enum: ['on', 'off'] })
  decrease?: 'on' | 'off';

  @ApiPropertyOptional({ enum: ['on', 'off'] })
  increase?: 'on' | 'off';

  @ApiPropertyOptional({ type: 'number' })
  max_price?: number;

  @ApiPropertyOptional({ type: 'number' })
  min_price?: number;

  @ApiPropertyOptional({ type: 'number' })
  step?: number;
}
