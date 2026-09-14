export interface WaterPurifierSourceMedia {
  fileName: string;
  bytes: number;
  sha256: string;
  durationSeconds: number;
  width: 1080;
  height: 1920;
  framesPerSecond: 30 | 60;
  videoCodec: 'h264' | 'hevc';
  videoProfile: 'Main' | 'Main 10';
  pixelFormat: 'yuv420p' | 'yuv420p10le';
  audioCodec: 'aac' | 'pcm_s16le';
}

export interface WaterPurifierVideoAsset {
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
  audioCodec: 'aac' | null;
}

export interface WaterPurifierPosterAsset {
  path: string;
  bytes: number;
  sha256: string;
  width: 1080;
  height: 1920;
  codec: 'webp';
  pixelFormat: 'yuv420p';
}

export interface WaterPurifierMediaItem {
  slug: string;
  displayOrder: number;
  aspectRatio: '9/16';
  source: WaterPurifierSourceMedia;
  preview: {
    startSeconds: number;
    endSeconds: number;
    selectionReason: string;
    asset: WaterPurifierVideoAsset;
  };
  poster: {
    sourceTimeSeconds: number;
    asset: WaterPurifierPosterAsset;
  };
  full: WaterPurifierVideoAsset;
}

export const waterPurifierMediaDeck: readonly WaterPurifierMediaItem[] = [
  {
    slug: 'g7s-multi-temperature',
    displayOrder: 1,
    aspectRatio: '9/16',
    source: {
      fileName: '2025-12-15 161055(1).mov',
      bytes: 157842411,
      sha256: '4E88048641FEA9FB12DD42BDBBCB94F0BE42158132010BE7A4A13EB2DF9462F9',
      durationSeconds: 79.62,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'hevc',
      videoProfile: 'Main',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
    preview: {
      startSeconds: 25,
      endSeconds: 33,
      selectionReason: '触控操作后连续展示出水、饮用与泡茶，产品主体清晰，首尾均处于稳定镜头。',
      asset: {
        path: 'projects/water-purifier/deck/g7s-multi-temperature/preview-h264.mp4',
        bytes: 5436444,
        sha256: '845841794B623691A9DD118D91744EC49D3E5E3614730CAE6385E67ACDB20F3C',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        audioCodec: null,
      },
    },
    poster: {
      sourceTimeSeconds: 1,
      asset: {
        path: 'projects/water-purifier/deck/g7s-multi-temperature/poster-card.webp',
        bytes: 93486,
        sha256: '5F495E13D521FF50DD007F34959785414B1B778C64C90C1318104A33720CD354',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/water-purifier/deck/g7s-multi-temperature/full-h264.mp4',
      bytes: 49555942,
      sha256: '2192D0CF7FD02CC9EF1D97822D4EBE1C239D2F50C3DFB370ECF102F24D4B1D90',
      durationSeconds: 79.62,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
  },
  {
    slug: 'summer-ice-drinks',
    displayOrder: 2,
    aspectRatio: '9/16',
    source: {
      fileName: '2025-08-06.mov',
      bytes: 118608711,
      sha256: 'A821CE8F5D6EDE89B25B40F9A2BF9E3E09306E417FE4144D4C34EFA5C2AC2C5F',
      durationSeconds: 62.136599,
      width: 1080,
      height: 1920,
      framesPerSecond: 60,
      videoCodec: 'hevc',
      videoProfile: 'Main',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
    preview: {
      startSeconds: 19.5,
      endSeconds: 27.5,
      selectionReason: '覆盖清洗杯体、整机、出冰和成品饮料，并在人物遮挡产品前以饮品特写收尾。',
      asset: {
        path: 'projects/water-purifier/deck/summer-ice-drinks/preview-h264.mp4',
        bytes: 3087126,
        sha256: '290FD6D0345E08104C09650088D34D08FAE102A9CD25779CFC098DFEEFA08814',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        audioCodec: null,
      },
    },
    poster: {
      sourceTimeSeconds: 24,
      asset: {
        path: 'projects/water-purifier/deck/summer-ice-drinks/poster-card.webp',
        bytes: 112076,
        sha256: 'B8E1674AEEA40CE52AC87BDC68BFC32BE2F53BFA128FD930939E048680BF6385',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/water-purifier/deck/summer-ice-drinks/full-h264.mp4',
      bytes: 32014313,
      sha256: '22D8BBF1C56685FC9350853E1A339D9184CD82EAE8494138BB3DAF1C2443E6BB',
      durationSeconds: 62.136,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
  },
  {
    slug: 'ice-workshop-demo',
    displayOrder: 3,
    aspectRatio: '9/16',
    source: {
      fileName: '2026-03-27 142804(1).mp4',
      bytes: 108266098,
      sha256: 'E2C37868E8B2E405A1B4CAB6C18EF20CD1408EA1D9C8D95E4885674B33277942',
      durationSeconds: 76.372146,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'Main',
      pixelFormat: 'yuv420p',
      audioCodec: 'pcm_s16le',
    },
    preview: {
      startSeconds: 18,
      endSeconds: 26,
      selectionReason: '连续展示两种绵绵冰、出品速度、按键与落冰，色彩和功能动作都清楚。',
      asset: {
        path: 'projects/water-purifier/deck/ice-workshop-demo/preview-h264.mp4',
        bytes: 3773796,
        sha256: 'EE6D79CE44CE9B8CF6CD1EF7457496E02C4EBCDCA026C426B8016E3D257E1DF1',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        audioCodec: null,
      },
    },
    poster: {
      sourceTimeSeconds: 21.5,
      asset: {
        path: 'projects/water-purifier/deck/ice-workshop-demo/poster-card.webp',
        bytes: 59146,
        sha256: '4D564130770697F9FDFE4AC1C8BA5BA425194D38A7BD71A1707578619F71D2E3',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/water-purifier/deck/ice-workshop-demo/full-h264.mp4',
      bytes: 38536574,
      sha256: '0567B8E3170072626F33BD958C741CE75291A157DFDF9F694F379528A164E364',
      durationSeconds: 76.373,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
  },
  {
    slug: 'modular-ice-system',
    displayOrder: 4,
    aspectRatio: '9/16',
    source: {
      fileName: '2025-08-18 192622(1).mp4',
      bytes: 67443360,
      sha256: '6FBA07BD74D49B306A5F3C01B8DFD59C7C6A713781B7A05AF4B4150908705918',
      durationSeconds: 48.412993,
      width: 1080,
      height: 1920,
      framesPerSecond: 60,
      videoCodec: 'hevc',
      videoProfile: 'Main',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
    preview: {
      startSeconds: 13,
      endSeconds: 21,
      selectionReason: '从完整模块组合进入冰槽、弹冰与饮品镜头，避开前段鼠标指针和后段儿童画面。',
      asset: {
        path: 'projects/water-purifier/deck/modular-ice-system/preview-h264.mp4',
        bytes: 2741683,
        sha256: '4B6424CCDEA5BE7399AA3EB1098788DA32A52435B90F7E5330BBF747F77CADE8',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        audioCodec: null,
      },
    },
    poster: {
      sourceTimeSeconds: 13.5,
      asset: {
        path: 'projects/water-purifier/deck/modular-ice-system/poster-card.webp',
        bytes: 114218,
        sha256: '4AB0EC31239512D8BAF50AA464E49BD8AC33ED02AA894D653A1369CBD5E51293',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/water-purifier/deck/modular-ice-system/full-h264.mp4',
      bytes: 14767714,
      sha256: '5A0156B30217E8FDB022C968ACD694A47C46906C641AA59994091058FDA27DEA',
      durationSeconds: 48.414,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
  },
  {
    slug: 'g7s-cabinet-brew',
    displayOrder: 5,
    aspectRatio: '9/16',
    source: {
      fileName: '2025-10-23 154547(1).mp4',
      bytes: 58190678,
      sha256: '2514427EA08E3948B5EC35F6EFBBAA835A33B3B10EFDD74813B20AF1EB0E8250',
      durationSeconds: 29.419002,
      width: 1080,
      height: 1920,
      framesPerSecond: 60,
      videoCodec: 'hevc',
      videoProfile: 'Main 10',
      pixelFormat: 'yuv420p10le',
      audioCodec: 'aac',
    },
    preview: {
      startSeconds: 14.5,
      endSeconds: 22.5,
      selectionReason: '药材入壶、升温、煮沸、慢炖与汤羹连续出现，机器和使用结果均清晰。',
      asset: {
        path: 'projects/water-purifier/deck/g7s-cabinet-brew/preview-h264.mp4',
        bytes: 2511671,
        sha256: '8C12CE406559BEC8450F53468AE716032974844DE6D4C16A56EB09F3CCFDBE30',
        durationSeconds: 8,
        width: 1080,
        height: 1920,
        framesPerSecond: 30,
        videoCodec: 'h264',
        videoProfile: 'High',
        pixelFormat: 'yuv420p',
        audioCodec: null,
      },
    },
    poster: {
      sourceTimeSeconds: 18.5,
      asset: {
        path: 'projects/water-purifier/deck/g7s-cabinet-brew/poster-card.webp',
        bytes: 114082,
        sha256: 'DF2861928D25712268D724149DF6237F3947F5CEFFF1EDA7183602A48D933829',
        width: 1080,
        height: 1920,
        codec: 'webp',
        pixelFormat: 'yuv420p',
      },
    },
    full: {
      path: 'projects/water-purifier/deck/g7s-cabinet-brew/full-h264.mp4',
      bytes: 10843584,
      sha256: '3B201B98000A3CEB2E7AB4735597A83BFC6920CEBBCBA3DF2D3005C0680E2268',
      durationSeconds: 29.433333,
      width: 1080,
      height: 1920,
      framesPerSecond: 30,
      videoCodec: 'h264',
      videoProfile: 'High',
      pixelFormat: 'yuv420p',
      audioCodec: 'aac',
    },
  },
];
