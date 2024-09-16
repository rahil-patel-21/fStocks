// Imports
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({})
export class RawData extends Model<RawData> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column({
    allowNull: true,
    type: DataType.STRING(32),
  })
  type: string;

  @Column({
    allowNull: true,
    type: DataType.JSONB,
  })
  value: any;
}
