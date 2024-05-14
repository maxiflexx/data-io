import axios, { AxiosInstance } from 'axios';
import { isBefore, subDays, subMinutes } from 'date-fns';

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
const DATA_IO_URL = 'http://localhost:3001';

(async () => {
  const upbitInstance = getInstance(UPBIT_URL);

  const marketName = 'KRW-BTC';
  const endDates = generateEndDates();
  const count = 200;

  const dataIoInstance = getInstance(DATA_IO_URL);

  for (let endDate of endDates) {
    const { data } = await upbitInstance.get('/v1/candles/minutes/1', {
      params: {
        market: marketName,
        to: endDate,
        count,
      },
    });

    const converted = convertData(data);
    await dataIoInstance.post('/coins', converted);
    await sleep(500);
  }
})();
