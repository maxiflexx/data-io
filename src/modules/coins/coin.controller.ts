import {
  Body,
  Controller,
  Get,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoinService } from './coin.service';
import { GetCoinsByQueryDto } from './dtos/get.dto';
import { UpsertCoinDto } from './dtos/upsert.dto';

@ApiTags('coins')
@Controller('/coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get()
  async search(@Query() query: GetCoinsByQueryDto) {
    return await this.coinService.getCoinsByQuery(query);
  }

  @Post()
  async push(
    @Body(new ParseArrayPipe({ items: UpsertCoinDto })) data: UpsertCoinDto[],
  ) {
    return await this.coinService.upsertCoins(data);
  }
}
