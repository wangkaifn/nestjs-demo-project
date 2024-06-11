import { Global, Module } from '@nestjs/common';
import { IpQueryService } from './ip-query.service';
import { IpQueryController } from './ip-query.controller';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [IpQueryController],
  providers: [IpQueryService],
  exports: [IpQueryService],
})
export class IpQueryModule {}
