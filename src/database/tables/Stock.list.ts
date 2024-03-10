// Imports
import { StockPricing } from './Stock.pricing';
import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';

@Table({})
export class StockList extends Model<StockList> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column({
    allowNull: false,
    comment: 'Name of the stock',
    type: DataType.STRING(128),
    unique: true,
  })
  name: string;

  @Column({
    allowNull: false,
    comment: 'Short name of the stock',
    type: DataType.STRING(128),
    unique: true,
  })
  shortName: string;

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  isActive: boolean;

  @Column({
    allowNull: true,
    defaultValue: 0,
    type: DataType.DOUBLE,
  })
  invest: Date;

  @Column({
    allowNull: true,
    defaultValue: 0,
    type: DataType.DOUBLE,
  })
  risk: Date;

  @Column({
    allowNull: true,
    defaultValue: 0,
    type: DataType.INTEGER,
  })
  dhanId: number;

  @HasMany(() => StockPricing)
  stockPricingList: StockPricing[];
}
