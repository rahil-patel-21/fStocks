// Imports
import { Injectable } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';

@Injectable()
export class DatabaseManager {
  async getAll(model: ModelCtor<Model>, attributes: any, options: any = {}) {
    const listData = await model.findAll({
      attributes,
      ...options,
      nest: true,
    });
    return listData.map((element) => element.get({ plain: true }));
  }

  async insert(model: ModelCtor<Model>, data: any) {
    return (await model.create(data, { raw: true })).get();
  }

  async bulkInsert(model: ModelCtor<Model>, list: any) {
    return await model.bulkCreate(list, { ignoreDuplicates: true });
  }

  async updateOne(model: ModelCtor<Model>, data: any, id: any) {
    if (!id || !data) throw new Error();
    return await model.update(data, { limit: 1, where: { id } });
  }
}
