// Imports
import * as env from 'dotenv';

env.config();

export const Env = {
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL,
  },

  dhan: {
    topValueUrl: process.env.DHAN_TOP_VALUES,
    optChainUrl: process.env.DHAN_OPT_CHAIN,
  },

  server: {
    isCronEnabled: process.env.SERVER_CRON === 'TRUE',
    port: process.env.SERVER_PORT ?? 3000,
  },

  telegram: {
    devIds: process.env.TELEGRAM_DEV_IDS?.split(',') ?? [],
    botTokens: process.env.TELEGRAM_BOT_TOKENS?.split(',') ?? [],
  },
};
