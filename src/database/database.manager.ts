// Imports
import { Injectable } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';

@Injectable()
export class DatabaseManager {
  async insert(model: ModelCtor<Model>, data: any) {
    return (await model.create(data, { raw: true })).get();
  }
}
