import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { CreateShortLinkDto } from './dto/create-short-link.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ShortLinkService {
  @Inject(PrismaService)
  private readonly prisma: PrismaService;

  @Inject(ConfigService)
  private readonly configService: ConfigService;

  async createShortLink(createShortLinkDto: CreateShortLinkDto) {
    // 找到没有被使用的短链码
    let shortCode = await this.prisma.uniqueShortCode.findFirst({
      where: {
        isEnabled: false,
      },
    });

    const API_URL = this.configService.get('API_URL');

    if (!shortCode) {
      shortCode = await this.createUniqueShortCode();
    }
    // 更新短链码状态
    await this.prisma.uniqueShortCode.update({
      where: {
        id: shortCode.id,
        code: shortCode.code,
      },
      data: {
        isEnabled: true,
      },
    });
    await this.prisma.shortLink.create({
      data: {
        desc: createShortLinkDto.desc,
        title: createShortLinkDto.title,
        originalUrl: createShortLinkDto.originalUrl,
        shortCode: shortCode.code,
        shortLink: `/short-link/${shortCode.code}`,
      },
    });
    return {
      message: '短链接生成成功',
      data: `${API_URL}/short-link/${shortCode.code}`,
    };
  }

  /**
   * 生成并检查唯一的短链码
   * @returns 唯一的短链码
   */
  //@Cron(CronExpression.EVERY_5_SECONDS)
  async createUniqueShortCode() {
    const code = await this.generateShortCode(8);
    // 检查该短链码是否已经存在
    const isExist = this.prisma.uniqueShortCode.findUnique({
      where: {
        code,
      },
    });
    if (isExist) {
      this.createUniqueShortCode;
    }
    return await this.prisma.uniqueShortCode.create({
      data: {
        code,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async batchCreateUniqueShortCode() {
    for (let i = 0; i < 1000; i++) {
      this.createUniqueShortCode();
    }
  }

  /**
   * 生成指定长度的短链码
   * @param length 生成的短链码的长度
   * @returns 生成的短链码
   */
  async generateShortCode(length = 8): Promise<string> {
    // 去除几个相似性的字符
    const characters =
      '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';

    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }
}
