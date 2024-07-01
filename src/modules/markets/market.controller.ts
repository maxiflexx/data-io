import {
  Body,
  Controller,
  Get,
  Param,
  ParseArrayPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateMarketDto } from './dtos/update.dto';
import { UpsertMarketDto } from './dtos/upsert.dto';
import { MarketService } from './market.service';

@ApiTags('markets')
@Controller('/markets')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get()
  async searchAll() {
    return await this.marketService.getMarkets();
  }

  @Post()
  async push(
    @Body(new ParseArrayPipe({ items: UpsertMarketDto }))
    data: UpsertMarketDto[],
  ) {
    return await this.marketService.upsertMarkets(data);
  }

  @Put('/:marketCode')
  async update(
    @Param('marketCode') marketCode: string,
    @Body() data: UpdateMarketDto,
  ) {
    return await this.marketService.updateMarket(marketCode, data);
  }
}
