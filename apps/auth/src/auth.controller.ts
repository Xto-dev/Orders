import { Body, Controller, Post, UseGuards, Request, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body('username') username: string, @Body('password') password: string) {
    if (!username || !password || password.length < 6) {
      throw new BadRequestException('Username and password (min 6 chars) required');
    }
    return this.authService.register(username, password);
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(body.username, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('test')
  getProfile(@Request() req) {
    return req.user;
  }
}