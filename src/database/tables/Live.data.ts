// Imports
import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { StockList } from './Stock.list';

@Table({
  indexes: [{ fields: ['stockId'], using: 'BTREE' }],
})
export class LiveData extends Model<LiveData> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ForeignKey(() => StockList)
  @Column({
    allowNull: true,
    comment: 'Primary key of Stock list table',
    type: DataType.INTEGER,
  })
  stockId: number;

  @BelongsTo(() => StockList, {
    foreignKey: 'stockId',
    targetKey: 'id',
    constraints: false,
  })
  stockData: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  price: number;

  @Column({
    allowNull: true,
    type: DataType.DOUBLE,
  })
  prev_price: number;

  @Column({
    allowNull: true,
    type: DataType.DOUBLE,
  })
  price_diff: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  total_buy: number;

  @Column({
    allowNull: true,
    type: DataType.DOUBLE,
  })
  prev_total_buy: number;

  @Column({
    allowNull: true,
    type: DataType.DOUBLE,
  })
  buy_diff: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  total_sell: number;

  @Column({
    allowNull: true,
    type: DataType.DOUBLE,
  })
  prev_total_sell: number;

  @Column({
    allowNull: true,
    type: DataType.DOUBLE,
  })
  sell_diff: number;
}
