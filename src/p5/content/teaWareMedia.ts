export interface TeaWareDuplicateSource {
  fileName: string;
  bytes: number;
  sha256: string;
  durationSeconds: number;
  duplicateOf: string;
  videoStreamMd5: string;
  audioStreamMd5: string;
}

export interface TeaWareSourceMedia {
  fileName: string;
  bytes: number;
  sha256: string;
  durationSeconds: number;
  width: 1080;
  height: 1920;
  framesPerSecond: 30;
  videoCodec: 'hevc';
  videoProfile: 'Main 10';
  pixelFormat: 'yuv420p10le';
  colorSpace: 'bt709';
  audioCodec: 'aac';
  audioSampleRate: 44100;
  audioChannels: 2;
  videoStreamMd5: string;
  audioStreamMd5: string;
  duplicateOf: null;
  aliases: readonly TeaWareDuplicateSource[];
  retentionReason: string;
}

export interface TeaWareVideoAsset {
  path: string;
  bytes: number;
  sha256: string;
  durationSeconds: number;
  width: 1080;
  height: 1920;
  framesPerSecond: 30;
  videoCodec: 'h264';
  videoProfile: 'High';
  pixelFormat: 'yuv420p';
  colorSpace: 'bt709';
  faststart: true;
  audioCodec: 'aac' | null;
  audioSampleRate: 48000 | null;
  audioChannels: 2 | null;
}

export interface TeaWarePosterAsset {
  path: string;
  bytes: number;
  sha256: string;
  width: 1080;
  height: 1920;
  codec: 'webp';
  pixelFormat: 'yuv420p';
}

export interface TeaWareMediaItem {
  slug: string;
  displayOrder: number;
  aspectRatio: '9/16';
  frameTreatment: {
    mode: 'none';
    reason: string;
  };
  source: TeaWareSourceMedia;
  preview: {
    startSeconds: number;
    endSeconds: number;
    selectionReason: string;
    asset: TeaWareVideoAsset;
  };
  poster: {
    sourceTimeSeconds: number;
    asset: TeaWarePosterAsset;
  };
  full: TeaWareVideoAsset;
}

export const teaWareMediaDeck: readonly TeaWareMediaItem[] = [
  {
    slug: 'portable-tea-box',
    displayOrder: 1,
    aspectRatio: '9/16',
    frameTreatment: {
      mode: 'none',
      reason: '源片已是 1080×1920 的 9:16 竖屏画面，未裁切或补边。',
    },
    source: {
      fileName: '2dd5adf34d21d7084354d521f2d9f32a_raw.mp4',
      bytes: 59213754,
      sha256: '96705999C7418F8E305C5B16805280840F0CE3059F7A224BB8CB4381A56FDD3F',
      durationSeconds: 32.020295,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'hevc',
      videoProfile: 'Main 10',
      pixelFormat: 'yuv420p10le',
      colorSpace: 'bt709',
      audioCodec: 'aac',
      audioSampleRate: 44100,
      audioChannels: 2,
      videoStreamMd5: '42941344cf9ff2eaf1217acd60176384',
      audioStreamMd5: 'b178d27be6327183c16c1bc0be61bbab',
      duplicateOf: null,
      aliases: [
        {
          fileName: '12.14阿峰合一4.MOV',
          bytes: 59214725,
          sha256: '9A502346CCE1AD9EEE9C6CF1AB8E37C16A2CA8AA5C64DBD0BF2C6942DAB814D4',
          durationSeconds: 32.020295,
          duplicateOf: '2dd5adf34d21d7084354d521f2d9f32a_raw.mp4',
          videoStreamMd5: '42941344cf9ff2eaf1217acd60176384',
          audioStreamMd5: 'b178d27be6327183c16c1bc0be61bbab',
        },
      ],
      retentionReason:
        '两份文件的解码前视频流与音频流 MD5 均相同，仅容器元数据不同；保留体积略小且扩展名便于跨平台处理的 MP4 作为唯一转码源。',
    },
    preview: {
      startSeconds: 1,
      endSeconds: 9,
      selectionReason:
        '从绿植茶室的完整茶盒陈列进入开扣与轻量茶具组件展示，主体持续清晰，首尾均为稳定镜头。',
      asset: {
        path: 'projects/tea-ware/deck/portable-tea-box/preview-h264.mp4',
        bytes: 3353679,
        sha256: '509A44EBF4060C516F1B83165CD4217BF8364E65C9D8F86552B8E291BE521A9A',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        colorSpace: 'bt709',
        faststart: true,
        audioCodec: null,
        audioSampleRate: null,
        audioChannels: null,
      },
    },
    poster: {
      sourceTimeSeconds: 2,
      asset: {
        path: 'projects/tea-ware/deck/portable-tea-box/poster-card.webp',
        bytes: 210422,
        sha256: 'E642325CA5D0CA9ACCC3B50C75004327BF7E71B5733AD780153FED20473FA4EF',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/tea-ware/deck/portable-tea-box/full-h264.mp4',
      bytes: 12229659,
      sha256: '8E69470E13C651CF4CBBE1D4C8E4DD430BDE2026EB68F4B511211EAB545A691A',
      durationSeconds: 32.042,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      colorSpace: 'bt709',
      faststart: true,
      audioCodec: 'aac',
      audioSampleRate: 48000,
      audioChannels: 2,
    },
  },
  {
    slug: 'titanium-tea-pour',
    displayOrder: 2,
    aspectRatio: '9/16',
    frameTreatment: {
      mode: 'none',
      reason: '源片已是 1080×1920 的 9:16 竖屏画面，未裁切或补边。',
    },
    source: {
      fileName: '9c005ee7754f78289b96a06ac19f1681_raw.mp4',
      bytes: 27568908,
      sha256: 'BFD732D914FB941C5EB1BABF3F401FE2695E31E0428849783BF76CE579C0609E',
      durationSeconds: 18.933333,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'hevc',
      videoProfile: 'Main 10',
      pixelFormat: 'yuv420p10le',
      colorSpace: 'bt709',
      audioCodec: 'aac',
      audioSampleRate: 44100,
      audioChannels: 2,
      videoStreamMd5: 'af54d3c2d53cd1f996a1b422565af595',
      audioStreamMd5: '8aae7d91eb7b49e13b83e9b82bc213d1',
      duplicateOf: null,
      aliases: [
        {
          fileName: '12.14阿峰合一2.MOV',
          bytes: 27569878,
          sha256: '380846FF36B60AA3846C0A6CF530D86977324AB1DCE6CF0DE38FF8C5D6C69E6A',
          durationSeconds: 18.933333,
          duplicateOf: '9c005ee7754f78289b96a06ac19f1681_raw.mp4',
          videoStreamMd5: 'af54d3c2d53cd1f996a1b422565af595',
          audioStreamMd5: '8aae7d91eb7b49e13b83e9b82bc213d1',
        },
      ],
      retentionReason:
        '两份文件的解码前视频流与音频流 MD5 均相同，仅容器元数据不同；保留体积略小且扩展名便于跨平台处理的 MP4 作为唯一转码源。',
    },
    preview: {
      startSeconds: 0.2,
      endSeconds: 8.2,
      selectionReason:
        '连续覆盖清水注入、钛茶具全景、琥珀色茶汤与滤茶动作，产品主体和使用过程均清楚。',
      asset: {
        path: 'projects/tea-ware/deck/titanium-tea-pour/preview-h264.mp4',
        bytes: 1910513,
        sha256: 'AFDD1BC9D04AA377B122580CDA4C9E5198DE6DE05B4B31C47A7343E5D3AA51CA',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        colorSpace: 'bt709',
        faststart: true,
        audioCodec: null,
        audioSampleRate: null,
        audioChannels: null,
      },
    },
    poster: {
      sourceTimeSeconds: 7.2,
      asset: {
        path: 'projects/tea-ware/deck/titanium-tea-pour/poster-card.webp',
        bytes: 55266,
        sha256: '753C4E3BF4496E3CEBE0DF284B84F2697275E39FD4B413EDD5EE7A7FB74632C0',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/tea-ware/deck/titanium-tea-pour/full-h264.mp4',
      bytes: 4911868,
      sha256: '0EABF71D1828DE986102EE3844C802F7AB536A1A94861565CA4CFB02E361A194',
      durationSeconds: 18.946,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      colorSpace: 'bt709',
      faststart: true,
      audioCodec: 'aac',
      audioSampleRate: 48000,
      audioChannels: 2,
    },
  },
  {
    slug: 'titanium-set-breakdown',
    displayOrder: 3,
    aspectRatio: '9/16',
    frameTreatment: {
      mode: 'none',
      reason: '源片已是 1080×1920 的 9:16 竖屏画面，未裁切或补边。',
    },
    source: {
      fileName: '12.14阿峰合一3.MOV',
      bytes: 59331670,
      sha256: 'C955FB6DC188BA233C86BCD3292CF74D692441F3AB7BC06B44D7DEBC4782F856',
      durationSeconds: 31.648798,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'hevc',
      videoProfile: 'Main 10',
      pixelFormat: 'yuv420p10le',
      colorSpace: 'bt709',
      audioCodec: 'aac',
      audioSampleRate: 44100,
      audioChannels: 2,
      videoStreamMd5: '1b9f028b4d10a059dba9cc76bba51f5d',
      audioStreamMd5: '88b64e0f7d463db722bd8448a3d6778f',
      duplicateOf: null,
      aliases: [],
      retentionReason: '与其余四份文件的音视频流 MD5 均不同，作为独立内容保留。',
    },
    preview: {
      startSeconds: 8,
      endSeconds: 16,
      selectionReason:
        '从收纳状态进入盖碗、杯具和材质结构近景，动作连续，完整茶具在结尾保持清晰。',
      asset: {
        path: 'projects/tea-ware/deck/titanium-set-breakdown/preview-h264.mp4',
        bytes: 2517282,
        sha256: '65F1D08CEB8F0633C12B900CD32438A295FCEA0564F865F7BEC7A0D2CBE4D246',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        colorSpace: 'bt709',
        faststart: true,
        audioCodec: null,
        audioSampleRate: null,
        audioChannels: null,
      },
    },
    poster: {
      sourceTimeSeconds: 15.5,
      asset: {
        path: 'projects/tea-ware/deck/titanium-set-breakdown/poster-card.webp',
        bytes: 74116,
        sha256: '5DE049D38F5C6034AA9E3359FEAAD802A36C1664595E34401EE656D96AAA210E',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/tea-ware/deck/titanium-set-breakdown/full-h264.mp4',
      bytes: 11768041,
      sha256: 'B297CB964B4E21054F5BBD80C707C5E3EB3B60262D00EBBBB93AE5D53E83C410',
      durationSeconds: 31.67,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      colorSpace: 'bt709',
      faststart: true,
      audioCodec: 'aac',
      audioSampleRate: 48000,
      audioChannels: 2,
    },
  },
];
