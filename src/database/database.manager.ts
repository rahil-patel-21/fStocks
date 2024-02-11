// Imports
import { Injectable } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';

@Injectable()
export class DatabaseManager {
  async getAll(model: ModelCtor<Model>, attributes: any, options: any = {}) {
    return await model.findAll({ attributes, ...options, raw: true });
  }

  async insert(model: ModelCtor<Model>, data: any) {
    return (await model.create(data, { raw: true })).get();
  }

  async bulkInsert(model: ModelCtor<Model>, list: any) {
    return await model.bulkCreate(list, { ignoreDuplicates: true });
  }
}
