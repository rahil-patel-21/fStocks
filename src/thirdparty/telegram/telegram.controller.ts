// Imports
import { Body, Controller, Post } from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly service: TelegramService) {}

  @Post('sendMsg')
  async funSendMsg(@Body() body) {
    return await this.service.sendMessage(body?.msg);
  }
}
