// Imports
import { Table, Column, Model, DataType } from 'sequelize-typescript';

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
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  isActive: boolean;

  @Column({
    allowNull: false,
    comment: '1 -> B1',
    defaultValue: 1,
    type: DataType.SMALLINT,
  })
  source: number;

  @Column({
    allowNull: true,
    type: DataType.TEXT,
  })
  sourceUrl: string;

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
    type: DataType.DATE,
  })
  syncedOn: Date;
}
