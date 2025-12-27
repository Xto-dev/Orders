import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './prisma.service';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(password, user.password) && user.isEmailConfirmed) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async register(email: string, username: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email);
    if (!validEmail) {
      throw new Error('Invalid email format');
    }

    let user;
    try {
      user = await this.prisma.user.create({
        data: { email, username, password: hashedPassword },
      });
      
    } catch (e) {
      throw e;
    }
    
    const eventId = `evt_${uuidv4()}`;
    this.kafkaClient.emit('user-events', {
      eventId,
      event: 'user.registered',
      userId: user.id,
      email: user.email,
    });

    const { password: _, ...result } = user;
    return result;
  }

  async confirmEmail(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isEmailConfirmed: true },
    });
    return user;
  }
}