export interface Coin {
  market: string;
  candleDateTimeUtc: Date;
  candleDateTimeKst: Date;
  openingPrice: number;
  highPrice: number;
  lowPrice: number;
  timestamp: number;
  candleAccTradePrice: number;
  candleAccTradeVolume: number;
  tradePrice: number;
  unit: number;
}
