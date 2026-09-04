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
  label: 'COMMERCIAL FILM / 茶具短视频',
  description: '围绕公道杯的办公喝茶痛点与品牌溢价，以及游侠纯钛外出与露营茶具的材质、配色和便携场景，完成从布景到千川投放的内容闭环。',
  durationLabel: '18—32 秒',
  statusLabel: '已完成制作与千川投放',
  process: [
    {
      stage: '产品与场景',
      title: '为两类茶具建立不同表达方向',
      body: '围绕公道杯与游侠纯钛外出、露营茶具拆分产品特征和使用场景，让两类产品各自保留清晰的内容重点。',
    },
    {
      stage: '公道杯表达',
      title: '从办公喝茶痛点建立价值感',
      body: '从办公喝茶的实际痛点切入，通过布景、光影、画面质感和产品细节表达使用价值与品牌溢价。',
    },
    {
      stage: '游侠产品表达',
      title: '突出纯钛材质与户外便携',
      body: '突出纯钛材质、可定制配色、便携性，以及外出与露营场景中的产品使用方式。',
    },
    {
      stage: '布景与拍摄',
      title: '按使用场景完成布景与拍摄',
      body: '根据办公、外出与露营等使用场景安排画面、道具与机位，完成产品细节和使用动作的拍摄。',
    },
    {
      stage: '后期与包装',
      title: '把剪辑、调色与包装做成完整成片',
      body: '完成剪辑、调色与包装处理，把拍摄素材整理为可发布的商业短视频。',
    },
    {
      stage: '上传与投放',
      title: '完成上传投放并复看内容结果',
      body: '完成平台上传与千川投放；其中一条公道杯素材后续半年累计千川消耗 80 万元，投产比 1:7。',
    },
  ],
};
