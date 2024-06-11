import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from 'nestjs-prisma';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async getHello(): Promise<string> {
    const code = await this.prisma.uniqueShortCode.create({
      data: {
        code: 'DHCNSI',
      },
    });
    console.log(code);

    return await this.appService.getHello();
  }
}
