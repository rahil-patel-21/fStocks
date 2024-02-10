// Imports
import { Env } from 'src/constants/env.config';
import { Sequelize } from 'sequelize-typescript';
import { ThirdPartyTrafficTable } from '../tables/Thirdparty.traffic.table';

export const DatabaseProvider = [
  {
    provide: 'DATABASE_MAIN',
    useFactory: async () => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: Env.database.host,
        logging: false,
        port: parseInt(Env.database.host, 10),
        username: Env.database.username,
        password: Env.database.password,
        database: Env.database.name,
        models: [ThirdPartyTrafficTable],
      });
      await sequelize.sync();

      return sequelize;
    },
  },
];
