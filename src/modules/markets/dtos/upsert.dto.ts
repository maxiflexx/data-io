import { Type } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';

export class UpsertMarketDto {
  @IsString()
  code: string;

  @IsString()
  koreanName: string;

  @IsString()
  englishName: string;

  @Type(() => Boolean)
  @IsBoolean()
  isEnabled: boolean;
}
