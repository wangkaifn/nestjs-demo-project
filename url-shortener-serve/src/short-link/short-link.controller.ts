import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Redirect,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ShortLinkService } from './short-link.service';
import { PrismaService } from 'nestjs-prisma';
import { CreateShortLinkDto } from './dto/create-short-link.dto';
import { Request } from 'express';
import { getUseragentInfo } from 'src/utils';
import { IpQueryService } from 'src/ip-query/ip-query.service';
@Controller('short-link')
export class ShortLinkController {
  constructor(private readonly shortLinkService: ShortLinkService) {}
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(IpQueryService)
  private readonly ipQueryService: IpQueryService;

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createShortLinkDto: CreateShortLinkDto) {
    return await this.shortLinkService.createShortLink(createShortLinkDto);
  }

  /**
   * 通过短链获取原始链接
   * @param shortCode 短链
   * @returns 原始链接
   */
  @Get('/:shortCode')
  @Redirect()
  async getOriginalUrl(
    @Param('shortCode') shortCode: string,
    @Req() request: Request,
  ) {
    const userAgent = request.headers['user-agent'];
    const ua = getUseragentInfo(userAgent);
    const ipAddress =
      '218.196.41.232' ||
      request.ip ||
      request.headers['x-forwarded-for'] ||
      request.connection.remoteAddress;

    console.log(ipAddress);

    const ipInfo = await this.ipQueryService.getIpInfo(ipAddress as string);
    console.log(ipInfo);

    const originalUrl = await this.prisma.shortLink.findUnique({
      where: {
        shortCode,
      },
    });

    if (!originalUrl) {
      return {
        url: '/',
        statusCode: HttpStatus.NOT_FOUND,
      };
    }

    await this.prisma.shortLink.update({
      where: {
        id: originalUrl.id,
      },
      data: {
        visitTimes: originalUrl.visitTimes + 1,
      },
    });

    // 更新记录访问
    await this.prisma.visit.create({
      data: {
        shortLinkId: originalUrl.id,
        ...ua,
        ...ipInfo?.data,
      },
    });
    return {
      url: originalUrl.originalUrl,
      statusCode: HttpStatus.FOUND,
    };
  }
}
