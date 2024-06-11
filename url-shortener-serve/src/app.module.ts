import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'nestjs-prisma';
import { ShortLinkModule } from './short-link/short-link.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { IpQueryModule } from './ip-query/ip-query.module';

@Module({
  imports: [
    PrismaModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ShortLinkModule,
    IpQueryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
