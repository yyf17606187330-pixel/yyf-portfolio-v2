import type { Project } from '../types/portfolio';
import { teaWareMediaDeck, type TeaWareMediaItem } from './teaWareMedia';

const primaryTeaWareMedia = teaWareMediaDeck[0];

export const teaWareProject: Project = {
  slug: 'tea-ware',
  title: '茶具',
  category: 'film',
  year: '2025.07—2025.11',
  client: '广州哲品家居用品有限公司',
  roles: ['布景', '拍摄', '剪辑', '调色', '包装', '上传', '千川投放'],
  featured: true,
  order: 2,
  aspectRatio: primaryTeaWareMedia.aspectRatio,
  poster: primaryTeaWareMedia.poster.asset.path,
  previewSrc: primaryTeaWareMedia.preview.asset.path,
  fullSrc: primaryTeaWareMedia.full.path,
};

export const teaWareProjectMediaItems: readonly TeaWareMediaItem[] = teaWareMediaDeck.slice(1);

export const teaWareCopy = {
  label: '茶具商业短视频',
  description: '为公道杯拍摄办公喝茶场景，为游侠纯钛茶具呈现户外使用方式；负责布景、拍摄、后期和千川投放。',
  durationLabel: '18—32 秒',
  statusLabel: '已完成制作与千川投放',
  results: [
    {
      title: '公道杯素材投放',
      body: '其中一条公道杯素材后续半年累计千川消耗 80 万元，投产比 1:7。',
    },
  ],
  process: [
    {
      stage: '公道杯表达',
      title: '呈现公道杯的办公使用场景',
      body: '从办公喝茶的实际痛点切入，用布景、光影、画面质感和产品细节，表达公道杯的使用价值与品牌溢价。',
    },
    {
      stage: '游侠茶具表达',
      title: '展示纯钛材质与户外便携性',
      body: '围绕游侠纯钛茶具，突出纯钛材质、可定制配色和便携性，呈现外出与露营中的使用方式。',
    },
    {
      stage: '布景与拍摄',
      title: '完成场景与产品细节拍摄',
      body: '根据办公、外出与露营的使用场景，安排道具、光影与机位，拍摄产品细节和使用动作。',
    },
    {
      stage: '后期与投放',
      title: '完成成片、上传与千川投放',
      body: '完成剪辑、调色、包装与平台上传，并负责千川投放及素材表现复盘。',
    },
  ],
};
