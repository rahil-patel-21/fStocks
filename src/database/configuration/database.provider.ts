// Imports
import { RawData } from '../tables/Raw.data';
import { Env } from 'src/constants/env.config';
import { LiveData } from '../tables/Live.data';
import { Sequelize } from 'sequelize-typescript';
import { StockList } from '../tables/Stock.list';
import { StockPricing } from '../tables/Stock.pricing';
import { MarketEntity } from '../tables/Markets';
import { ChainEntity } from '../tables/Chain.data';

export const DatabaseProvider = [
  {
    provide: 'DATABASE_MAIN',
    useFactory: async () => {
      const sequelize = new Sequelize({
        define: { timestamps: true, freezeTableName: true },
        dialect: 'postgres',
        host: Env.database.host,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
        logging: false,
        port: +Env.database.port,
        username: Env.database.username,
        password: Env.database.password,
        database: Env.database.name,
        models: [
          ChainEntity,
          LiveData,
          MarketEntity,
          RawData,
          StockList,
          StockPricing,
        ],
      });
      await sequelize.sync();

      return sequelize;
    },
  },
];
