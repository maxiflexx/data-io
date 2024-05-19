import axios, { AxiosInstance } from 'axios';
import { isBefore, subDays, subMinutes } from 'date-fns';
import * as fs from 'fs';

const sleep = async (milliseconds: number) => {
  return new Promise((r) => setTimeout(r, milliseconds));
};

const generateEndDates = () => {
  const now = new Date();
  const yesterday = subDays(now, 1);

  let current = now;
  let endDates: string[] = [];

  while (isBefore(yesterday, current)) {
    endDates.push(current.toISOString());

    current = subMinutes(current, 200);
  }
  return endDates;
};

const getInstance = (url: string): AxiosInstance => {
  return axios.create({
    baseURL: url,
    timeout: 1000 * 60,
    headers: {},
    maxBodyLength: 1000 * 1024 * 1024,
    maxContentLength: 1000 * 1024 * 1024,
  });
};

const convertData = (data: any[]) => {
  return data.map((d) => {
    const {
      candle_date_time_utc,
      candle_date_time_kst,
      opening_price,
      high_price,
      low_price,
      trade_price,
      candle_acc_trade_price,
      candle_acc_trade_volume,
      ...rest
    } = d;

    return {
      ...rest,
      candleDateTimeUtc: candle_date_time_utc,
      candleDateTimeKst: candle_date_time_kst,
      openingPrice: opening_price,
      highPrice: high_price,
      lowPrice: low_price,
      tradePrice: trade_price,
      candleAccTradePrice: candle_acc_trade_price,
      candleAccTradeVolume: candle_acc_trade_volume,
    };
  });
};

const UPBIT_URL = 'https://api.upbit.com';
const STATIC_URL = 'https://static.upbit.com';
const DATA_IO_URL = 'http://localhost:3001';

(async () => {
  const upbitInstance = getInstance(UPBIT_URL);
  const dataIoInstance = getInstance(DATA_IO_URL);
  const staticInstance = getInstance(STATIC_URL);

  // 20240514 업비트 시총 기준 탑 10
  const topMarkets = [
    'KRW-BTC',
    'KRW-ETH',
    'KRW-XRP',
    'KRW-ADA',
    'KRW-TRX',
    'KRW-DOT',
    'KRW-DOGE',
    'KRW-SOL',
    'KRW-AVAX',
    'KRW-SHIB',
  ];

  // // market 데이터 넣기
  const { data }: { data: any[] } = await upbitInstance.get('/v1/market/all', {
    params: {
      isDetails: false,
    },
  });

  const filteredAndConverted = data
    .filter((d) => d.market.includes('KRW'))
    .map((d) => {
      const { market, korean_name, english_name } = d;
      const isEnabled = topMarkets.includes(market);

      return {
        code: market,
        koreanName: korean_name,
        englishName: english_name,
        isEnabled,
      };
    });

  // await dataIoInstance.post('/markets', filteredAndConverted);

  // logo 다운로드
  for (const market of filteredAndConverted) {
    const code = market.code.split('-')[1];

    const imageResponse = await staticInstance.get(`/logos/${code}.png`, {
      responseType: 'stream',
    });
    imageResponse.data.pipe(fs.createWriteStream(`./public/${code}.png`));
  }

  // // Coin 데이터 넣기
  // const endDates = generateEndDates();
  // const count = 200;

  // for (const market of topMarkets) {
  //   for (const endDate of endDates) {
  //     const { data } = await upbitInstance.get('/v1/candles/minutes/1', {
  //       params: {
  //         market,
  //         to: endDate,
  //         count,
  //       },
  //     });

  //     const converted = convertData(data);
  //     await dataIoInstance.post('/coins', converted);
  //     await sleep(500);
  //   }
  // }
})();
