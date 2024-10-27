// Imports
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ timestamps: false })
export class OLHCEntity extends Model<OLHCEntity> {
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  sec_id: number;

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

  @Column({
    allowNull: false,
    type: DataType.STRING(8),
  })
  interval: string;
}
