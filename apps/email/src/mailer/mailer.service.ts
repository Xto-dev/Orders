import { Injectable, OnModuleInit } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class MailerService implements OnModuleInit {
  private transporter: Transporter;

  onModuleInit() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });
  }

  async sendConfirmationEmail(to: string, userId: string) {
    const confirmLink = `http://localhost:3000/auth/confirm?token=${userId}`;
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Confirm your email',
      text: `Click on the link: ${confirmLink}`,
    });
  }

  async sendPriceDropNotification(to: string, url: string, price: number) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: 'Price drop notification',
      text: `The price of ${url} has dropped to ${price}.`,
    });
  }
}