import { aiImageCase } from '../../content/aiImageCase';
import { resolveMediaUrl } from '../../lib/media';
import './AiImageCase.css';

function ImageWork({ item }: { item: (typeof aiImageCase.images)[number] }) {
  const url = resolveMediaUrl(item.src) ?? undefined;
  return (
    <figure className={item.width > item.height ? 'ai-image-case__work ai-image-case__work--wide' : 'ai-image-case__work'}>
      <a href={url} target="_blank" rel="noreferrer" aria-label={`查看大图：${item.title}（新标签页）`}>
        <img src={url} alt={item.title} width={item.width} height={item.height} loading="lazy" decoding="async" />
      </a>
      <figcaption>{item.title}</figcaption>
    </figure>
  );
}

export function AiImageCase() {
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
      <div className="ai-image-case__gallery" aria-label="AI 产品视觉精选">
        {aiImageCase.images.slice(0, 6).map((item) => <ImageWork key={item.id} item={item} />)}
      </div>
      <details className="ai-image-case__more">
        <summary>展开更多视觉 · 12 张<span aria-hidden="true">＋</span></summary>
        <div className="ai-image-case__gallery" aria-label="AI 产品视觉完整系列">
          {aiImageCase.images.slice(6).map((item) => <ImageWork key={item.id} item={item} />)}
        </div>
      </details>
    </article>
  );
}
