import { ArrowIcon } from '../navigation/ArrowIcon';
import { aiImageCase } from '../../content/aiImageCase';
import { resolveMediaUrl } from '../../lib/media';
import './AiImageCase.css';

interface AiImageCaseProps { onOpenImages?: (index: number, opener: HTMLElement) => void; }

function ImageWork({ item, index, onOpenImages }: AiImageCaseProps & { item: (typeof aiImageCase.images)[number]; index: number }) {
  const url = resolveMediaUrl(item.src) ?? undefined;
  return (
    <figure className={item.width > item.height ? 'ai-image-case__work ai-image-case__work--wide' : 'ai-image-case__work'}>
      <a href={url} target="_blank" rel="noreferrer" aria-label={`进入相册：${item.title}`}
        onClick={(event) => {
          if (!onOpenImages || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          onOpenImages(index, event.currentTarget);
        }}>
        <img src={url} alt={item.title} width={item.width} height={item.height} loading="lazy" decoding="async" />
        <span className="ai-image-case__cue" aria-hidden="true">进入相册 <ArrowIcon /></span>
      </a>
      <figcaption>{item.title}</figcaption>
    </figure>
  );
}

export function AiImageCase({ onOpenImages }: AiImageCaseProps) {
  return (
    <article className="ai-image-case" id="ai-image" aria-labelledby="ai-image-case-title">
      <header className="ai-image-case__heading">
        <div>
          <p className="ai-image-case__label">{aiImageCase.label}</p>
          <h3 id="ai-image-case-title">{aiImageCase.title}</h3>
          <p className="ai-image-case__description">{aiImageCase.description}</p>
        </div>
        <div className="ai-image-case__timing">
          <dl>
            <div><dt>以往 · 拍摄与修图</dt><dd>{aiImageCase.previous}</dd></div>
            <div><dt>这次 · AI 出图</dt><dd>{aiImageCase.current}</dd></div>
          </dl>
          <p>{aiImageCase.timingNote}</p>
        </div>
      </header>
      <div className="ai-image-case__entry">
        <button className="ai-image-case__open" type="button" onClick={(event) => onOpenImages?.(0, event.currentTarget)}>
          进入轮播相册 · {aiImageCase.images.length} 张 <span aria-hidden="true"><ArrowIcon /></span>
        </button>
        <p>进入后滚轮切换 · 点击照片放大</p>
      </div>
      <div className="ai-image-case__gallery" aria-label="AI 产品视觉精选">
        {aiImageCase.images.slice(0, 6).map((item, index) => <ImageWork key={item.id} item={item} index={index} onOpenImages={onOpenImages} />)}
      </div>
    </article>
  );
}
