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

@Table({})
export class StockPricing extends Model<StockPricing> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @ForeignKey(() => StockList)
  @Column({
    allowNull: false,
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
    comment: 'Opening market value',
    type: DataType.DOUBLE,
  })
  open: number;

  @Column({
    allowNull: false,
    comment: 'Opening market value',
    type: DataType.DOUBLE,
  })
  close: number;

  @Column({
    allowNull: false,
    comment:
      'Difference of open and close with respective of opening market value',
    type: DataType.DOUBLE,
  })
  closingDiff: number;

  @Column({
    allowNull: false,
    comment: 'High market value during session',
    type: DataType.DOUBLE,
  })
  high: number;

  @Column({
    allowNull: false,
    comment: 'Low market value during session',
    type: DataType.DOUBLE,
  })
  low: number;

  @Column({
    allowNull: false,
    comment:
      'Difference of high and low with respective of opening market value',
    type: DataType.DOUBLE,
  })
  volatileDiff: number;

  @Column({
    allowNull: false,
    comment: 'Time of the market session',
    type: DataType.DATE,
  })
  sessionTime: Date;

  @Column({
    allowNull: false,
    comment: 'Unique Id',
    type: DataType.STRING(32),
    unique: true,
  })
  uniqueId: string;
}
