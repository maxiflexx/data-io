import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { subDays } from 'date-fns';
import { IsBeforeDate } from 'src/common/decorators/date.decorator';

enum SortingDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetCoinsByQueryDto {
  @IsString()
  market: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsBeforeDate('endDate')
  startDate?: Date = subDays(new Date(), 1);

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date = new Date();

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number = 0;

  @IsOptional()
  @IsString()
  sortingField?: string = 'candleDateTimeKst';

  @IsOptional()
  @IsEnum(SortingDirection)
  sortingDirection?: SortingDirection = SortingDirection.DESC;
}
