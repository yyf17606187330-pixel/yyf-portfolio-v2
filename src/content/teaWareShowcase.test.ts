import { describe, expect, it } from 'vitest';
import { teaWareMediaDeck } from './teaWareMedia';
import { teaWareCopy, teaWareProject, teaWareProjectMediaItems } from './teaWareShowcase';

describe('teaWareShowcase', () => {
  it('publishes only the confirmed project identity, period and production scope', () => {
    expect(teaWareProject).toMatchObject({
      client: '广州哲品家居用品有限公司',
      year: '2025.07—2025.11',
      title: '茶具',
      aspectRatio: '9/16',
      roles: ['布景', '拍摄', '剪辑', '调色', '包装', '上传', '千川投放'],
    });
    expect(teaWareCopy.description).toContain('公道杯');
    expect(teaWareCopy.description).toContain('游侠纯钛');
    expect(teaWareCopy.process.map((item) => item.stage)).toEqual([
      '产品与场景',
      '公道杯表达',
      '游侠产品表达',
      '布景与拍摄',
      '后期与包装',
      '上传与投放',
    ]);
    expect(teaWareCopy.process.map((item) => item.body).join(' '))
      .toMatch(/办公喝茶.*品牌溢价/);
    expect(teaWareCopy.process.map((item) => item.body).join(' '))
      .toMatch(/纯钛.*可定制配色.*便携.*露营/);
    expect(teaWareCopy.process).toHaveLength(6);
    expect(teaWareCopy.process.map((item) => item.body).join(' '))
      .toMatch(/平台上传.*千川投放.*80 万元.*1:7/);
  });

  it('uses the three canonical tea ware films exactly once in the shared media deck', () => {
    expect(teaWareProjectMediaItems.map((item) => item.slug)).toEqual([
      'titanium-tea-pour',
      'titanium-set-breakdown',
    ]);

    const mountedFullSources = [
      teaWareProject.fullSrc,
      ...teaWareProjectMediaItems.map((item) => item.full.path),
    ];
    expect(mountedFullSources).toEqual(teaWareMediaDeck.map((item) => item.full.path));
    expect(new Set(mountedFullSources)).toHaveLength(3);
  });
});
