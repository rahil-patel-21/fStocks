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

  server: {
    port: process.env.SERVER_PORT,
  },

  telegram: {
    devIds: process.env.TELEGRAM_DEV_IDS?.split(',') ?? [],
    botToken: process.env.TELEGRAM_BOT_TOKEN,
  },
};
