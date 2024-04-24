import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class UpsertCoinDto {
  @IsString()
  market: string;

  @Type(() => Date)
  @IsDate()
  candleDateTimeUtc: Date;

  @Type(() => Date)
  @IsDate()
  candleDateTimeKst: Date;

  @Type(() => Number)
  @IsNumber()
  openingPrice: number;

  @Type(() => Number)
  @IsNumber()
  highPrice: number;

  @Type(() => Number)
  @IsNumber()
  lowPrice: number;

  @Type(() => Number)
  @IsNumber()
  timestamp: number;

  @Type(() => Number)
  @IsNumber()
  candleAccTradePrice: number;

  @Type(() => Number)
  @IsNumber()
  candleAccTradeVolume: number;

  @Type(() => Number)
  @IsNumber()
  tradePrice: number;

  @Type(() => Number)
  @IsNumber()
  unit: number;
}
