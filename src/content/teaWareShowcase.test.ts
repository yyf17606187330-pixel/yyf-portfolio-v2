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

    const process = teaWareCopy.process.map((item) => item.body).join(' ');
    expect(process).toMatch(/办公喝茶.*品牌溢价/);
    expect(process).toMatch(/纯钛.*可定制配色.*便携.*露营/);
    expect(process).toMatch(/道具.*光影.*机位.*产品细节.*使用动作/);
    expect(process).toMatch(/剪辑.*调色.*包装.*平台上传.*千川投放/);
  });

  it('keeps the later six-month result separate from process details and employment dates', () => {
    expect(teaWareCopy.results.map((item) => item.body)).toEqual([
      '一条未公开的公道杯千川投放素材，后续半年累计消耗 80 万元，投产比 1:7。下方选用哲品同项目作品示例，展示制作能力；展示片与该条投放素材不同。',
    ]);
    expect(teaWareCopy.process.map((item) => item.body).join(' '))
      .not.toMatch(/80 万元|1:7|半年/);
    expect(teaWareProject.year).toBe('2025.07—2025.11');
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
