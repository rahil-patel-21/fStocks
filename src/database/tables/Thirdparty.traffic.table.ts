// Imports
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({})
export class ThirdPartyTrafficTable extends Model<ThirdPartyTrafficTable> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column({
    allowNull: false,
    comment: '1 -> Supabase, 2 -> B1',
    type: DataType.SMALLINT,
  })
  source: Date;

  @Column({
    allowNull: false,
    comment: '1 -> Request, 2 -> Response',
    type: DataType.SMALLINT,
  })
  type: number;

  @Column({
    allowNull: false,
    defaultValue: {},
    type: DataType.JSONB,
  })
  value: any;
}
