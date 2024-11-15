// Imports
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ timestamps: false })
export class GainerEntity extends Model<GainerEntity> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  })
  id: number;

  @Column({
    allowNull: false,
    type: DataType.JSONB,
  })
  data: any;

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  date: Date;
}
