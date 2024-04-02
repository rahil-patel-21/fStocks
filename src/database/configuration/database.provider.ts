// Imports
import { Env } from 'src/constants/env.config';
import { Sequelize } from 'sequelize-typescript';
import { StockList } from '../tables/Stock.list';
import { StockPricing } from '../tables/Stock.pricing';

export const DatabaseProvider = [
  {
    provide: 'DATABASE_MAIN',
    useFactory: async () => {
      const sequelize = new Sequelize({
        define: { timestamps: true, freezeTableName: true },
        dialect: 'postgres',
        host: Env.database.host,
        logging: false,
        port: parseInt(Env.database.host, 10),
        username: Env.database.username,
        password: Env.database.password,
        database: Env.database.name,
        models: [StockList, StockPricing],
      });
      await sequelize.sync();

      return sequelize;
    },
  },
];
