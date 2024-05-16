import { Type } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class UpdateMarketDto {
  @Type(() => Boolean)
  @IsBoolean()
  isEnabled: boolean;
}
