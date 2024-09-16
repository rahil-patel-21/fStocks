// Imports
import { Injectable } from '@nestjs/common';
import { Env } from 'src/constants/env.config';
import { APIService } from 'src/utils/api.service';

@Injectable()
export class TelegramService {
  constructor(private readonly api: APIService) {}

  async sendMessage(text?: string) {
    const randomIndex = Math.floor(
      Math.random() * Env.telegram.botTokens.length,
    );
    const token = Env.telegram.botTokens[randomIndex];

    for (let index = 0; index < Env.telegram.devIds.length; index++) {
      try {
        const payload = {
          chat_id: Env.telegram.devIds[index],
          text,
        };

        this.api.post(
          `https://api.telegram.org/bot${token}/sendMessage`,
          payload,
        );
      } catch (error) {
        console.log({ error });
      }
    }

    return {};
  }
}
