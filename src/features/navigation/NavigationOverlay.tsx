import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { profile } from '../../content/profile';
import { FluidBackdrop } from '../fluid/FluidBackdrop';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useScrollLock } from '../../hooks/useScrollLock';
import { resolveMediaUrl } from '../../lib/media';

export type NavigationTarget = 'top' | 'capabilities' | 'about' | 'contact';

interface NavigationOverlayProps {
  open: boolean;
  opener: HTMLElement | null;
  onClose: () => void;
  target?: NavigationTarget;
}

const capabilities = [
  { index: '01', title: 'Film & Direction', skills: '编导 · 拍摄 · 剪辑 · 调色 · 基础特效' },
  { index: '02', title: 'Photography & Retouch', skills: '人像/商品棚拍 · 人像修图' },
  { index: '03', title: 'Visual Design', skills: 'PS 合成 · 平面修改与设计' },
  { index: '04', title: 'AI & Creative Tech', skills: 'AI 视频 · 工作流 · AI 前端' },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const targetSectionIds: Record<Exclude<NavigationTarget, 'top'>, string> = {
  capabilities: 'navigation-capabilities',
  about: 'navigation-about',
  contact: 'navigation-contact',
};

export function NavigationOverlay({ open, opener, onClose, target = 'top' }: NavigationOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [currentTarget, setCurrentTarget] = useState<NavigationTarget>(target);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const handleClose = useCallback(() => onClose(), [onClose]);
  const portraitUrl = resolveMediaUrl(profile.portrait);
  const wechatQrUrl = resolveMediaUrl(profile.wechatQr);
  const email = profile.email.trim();
  const emailHref = emailPattern.test(email) ? `mailto:${email}` : null;

  useScrollLock(open);
  useFocusTrap(dialogRef, open, handleClose, closeRef, opener);

  useLayoutEffect(() => {
    if (open) setCurrentTarget(target);
  }, [open, target]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!open || !dialog) {
      return;
    }

    const section = target === 'top'
      ? null
      : dialog.querySelector<HTMLElement>(`#${targetSectionIds[target]}`);
    dialog.scrollTop = section?.offsetTop ?? 0;
  }, [open, target]);

  const handleSectionNavigation = useCallback((
    event: ReactMouseEvent<HTMLAnchorElement>,
    nextTarget: Exclude<NavigationTarget, 'top'>,
  ) => {
    event.preventDefault();
    const dialog = dialogRef.current;
    const section = dialog?.querySelector<HTMLElement>(`#${targetSectionIds[nextTarget]}`);
    setCurrentTarget(nextTarget);
    if (dialog) dialog.scrollTop = section?.offsetTop ?? 0;
    section?.focus({ preventScroll: true });
  }, []);

  const handleWorkNavigation = useCallback((event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const destination = document.getElementById('works');
    handleClose();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${window.location.search}#works`,
    );
    window.setTimeout(() => {
      destination?.scrollIntoView?.({ block: 'start' });
      destination?.focus({ preventScroll: true });
    }, 0);
  }, [handleClose]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!open || !dialog || reducedMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: 'power4.inOut' } });

      timeline
        .fromTo(dialog, { yPercent: -100 }, { yPercent: 0, duration: 0.68 }, 0)
        .fromTo(
          '.navigation-overlay__nav a, .navigation-overlay__capability',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.42, stagger: 0.045, ease: 'power3.out' },
          0.3,
        );
    }, dialog);

    return () => context.revert();
  }, [open, reducedMotion]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      aria-label="全站导航"
      aria-describedby={currentTarget === 'top' ? undefined : `${targetSectionIds[currentTarget]}-title`}
      aria-modal="true"
      className="navigation-overlay"
      data-lenis-prevent
      ref={dialogRef}
      role="dialog"
      tabIndex={-1}
    >
      <FluidBackdrop region="menu" />
      <div className="navigation-overlay__topline">
        <p>{profile.latinName}</p>
        <button ref={closeRef} type="button" onClick={handleClose} aria-label="关闭菜单">
          CLOSE <span aria-hidden="true">×</span>
        </button>
      </div>

      <div className="navigation-overlay__layout">
        <nav className="navigation-overlay__nav" aria-label="覆盖层导航">
          <a href="#works" onClick={handleWorkNavigation}>WORK</a>
          <a
            aria-current={currentTarget === 'capabilities' ? 'location' : undefined}
            href="#navigation-capabilities"
            onClick={(event) => handleSectionNavigation(event, 'capabilities')}
          >
            CAPABILITIES
          </a>
          <a
            aria-current={currentTarget === 'about' ? 'location' : undefined}
            href="#navigation-about"
            onClick={(event) => handleSectionNavigation(event, 'about')}
          >
            ABOUT
          </a>
          <a
            aria-current={currentTarget === 'contact' ? 'location' : undefined}
            href="#navigation-contact"
            onClick={(event) => handleSectionNavigation(event, 'contact')}
          >
            CONTACT
          </a>
        </nav>

        <div className="navigation-overlay__details">
          <section id="navigation-capabilities" aria-labelledby="navigation-capabilities-title" tabIndex={-1}>
            <p className="eyebrow" id="navigation-capabilities-title">CAPABILITIES / 能力</p>
            <div className="navigation-overlay__capabilities">
              {capabilities.map((capability) => (
                <div className="navigation-overlay__capability" key={capability.index}>
                  <span>{capability.index}</span>
                  <h2>{capability.title}</h2>
                  <p>{capability.skills}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="navigation-overlay__about" id="navigation-about" aria-labelledby="navigation-about-title" tabIndex={-1}>
            {portraitUrl ? (
              <div className="navigation-overlay__portrait">
                <img alt={`${profile.name}个人肖像`} src={portraitUrl} />
              </div>
            ) : (
              <div className="navigation-overlay__portrait" aria-label="个人肖像待替换">
                <span>PORTRAIT</span>
                <span>个人肖像待替换</span>
              </div>
            )}
            <div>
              <p className="eyebrow" id="navigation-about-title">ABOUT / 关于</p>
              <h2>{profile.name}</h2>
              <p>{profile.positioning}</p>
              <p>{profile.bio}</p>
            </div>
          </section>

          <section className="navigation-overlay__contact" id="navigation-contact" aria-labelledby="navigation-contact-title" tabIndex={-1}>
            <div>
              <p className="eyebrow" id="navigation-contact-title">CONTACT / 联系</p>
              {emailHref ? <a href={emailHref}>{email}</a> : <p>{profile.email || '邮箱待补充'}</p>}
            </div>
            {wechatQrUrl ? (
              <div className="navigation-overlay__qr">
                <img alt={`${profile.name}微信二维码`} src={wechatQrUrl} />
              </div>
            ) : (
              <div className="navigation-overlay__qr" aria-label="微信二维码待替换">
                <span>WECHAT QR</span>
                <span>微信二维码待替换</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
