import { Module } from '@nestjs/common';
import { ShortLinkService } from './short-link.service';
import { ShortLinkController } from './short-link.controller';

@Module({
  controllers: [ShortLinkController],
  providers: [ShortLinkService],
})
export class ShortLinkModule {}
