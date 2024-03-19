// Imports
import { Env } from 'src/constants/env.config';
import * as TelegramBot from 'node-telegram-bot-api';
import { Injectable, OnModuleInit } from '@nestjs/common';

let chatBot;

@Injectable()
export class TelegramService implements OnModuleInit {
  onModuleInit() {
    try {
      if (chatBot) return;
      if (!Env.telegram.botToken) return;

      chatBot = new TelegramBot(Env.telegram.botToken, { polling: true });
      console.log('TELEGRAM BOT IS READY TO ROCK !');
    } catch (error) {
      console.log({ error });
    }
  }

  async sendMessage(content?: string) {
    try {
      console.log(content);
      if (!chatBot) return {};

      const queue = [];
      for (let index = 0; index < Env.telegram.devIds.length; index++) {
        try {
          queue.push(
            chatBot.sendMessage(
              Env.telegram.devIds[index],
              content ?? `This is a test message`,
            ),
          );
        } catch (error) {
          console.log({ error });
        }
      }
      await Promise.all(queue);
      return {};
    } catch (error) {
      console.log({ error });
    }
  }
}
