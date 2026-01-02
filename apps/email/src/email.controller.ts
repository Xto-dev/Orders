// apps/email/src/email/email.controller.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailerService } from './mailer/mailer.service';

@Controller()
export class EmailController {
  constructor(private mailer: MailerService) {}

  @EventPattern('user-events')
  async handleUserEvent(@Payload() payload: any) {
    if (payload.event === 'user.registered') {
      await this.mailer.sendConfirmationEmail(payload.email, payload.userId);
    }
  }

  @EventPattern('price.dropped')
  async handlePriceDrop(@Payload() payload: any) {
    await this.mailer.sendPriceDropNotification(payload.email, payload.url, payload.price);
  }
}