// Imports
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ timestamps: false })
export class MarketDepth extends Model<MarketDepth> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  sec_id: number;

  @Column({
    allowNull: false,
    type: DataType.STRING(64),
  })
  time: string;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  current_buy_quantity: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  current_sell_quantity: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  current_buy_dominance: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  total_buy_quantity: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  total_sell_quantity: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  total_buy_dominance: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  vol: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  Ltp: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  high_movement: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  movement_towards_high: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  open_interest: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  open_interest_change: number;

  @Column({
    allowNull: false,
    type: DataType.DOUBLE,
  })
  open_interest_p_ch: number;

  @Column({
    allowNull: false,
    type: DataType.STRING(32),
    unique: true,
  })
  hash: string;
}
