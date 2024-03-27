import { Controller, Get, Post } from '@nestjs/common';
import { CoinService } from './coin.service';

@Controller('/coins')
export class CoinController {
  constructor(private readonly coinService: CoinService) {}

  @Get()
  async getHello() {
    return await this.coinService.getHello();
  }

  @Post()
  async pushTest() {
    return await this.coinService.push();
  }
}
