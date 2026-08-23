import { useCallback, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { profile } from '../../content/profile';
import { FluidBackdrop } from '../fluid/FluidBackdrop';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useScrollLock } from '../../hooks/useScrollLock';

interface NavigationOverlayProps {
  open: boolean;
  opener: HTMLElement | null;
  onClose: () => void;
}

const capabilities = [
  { index: '01', english: 'SHOOTING & DIRECTION', chinese: '影像导演' },
  { index: '02', english: 'EDITING & COLOR', chinese: '剪辑与调色' },
  { index: '03', english: 'PHOTOGRAPHY & DESIGN', chinese: '摄影与视觉设计' },
  { index: '04', english: 'AI VIDEO & INTERACTIVE', chinese: 'AI 影像与交互' },
];

export function NavigationOverlay({ open, opener, onClose }: NavigationOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const handleClose = useCallback(() => onClose(), [onClose]);

  useScrollLock(open);
  useFocusTrap(dialogRef, open, handleClose, closeRef, opener);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!open || !dialog) {
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
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      aria-label="全站导航"
      aria-modal="true"
      className="navigation-overlay"
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
          <a href="#work" onClick={handleClose}>WORK</a>
          <a href="#capabilities">CAPABILITIES</a>
          <a href="#about">ABOUT</a>
          <a href="#contact">CONTACT</a>
        </nav>

        <div className="navigation-overlay__details">
          <section id="capabilities" aria-labelledby="capabilities-title">
            <p className="eyebrow" id="capabilities-title">CAPABILITIES / 能力</p>
            <div className="navigation-overlay__capabilities">
              {capabilities.map((capability) => (
                <div className="navigation-overlay__capability" key={capability.index}>
                  <span>{capability.index}</span>
                  <p>{capability.english}</p>
                  <p>{capability.chinese}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="navigation-overlay__about" id="about" aria-labelledby="about-title">
            <div className="navigation-overlay__portrait" aria-label="个人肖像待替换">
              <span>PORTRAIT</span>
              <span>个人肖像待替换</span>
            </div>
            <div>
              <p className="eyebrow" id="about-title">ABOUT / 关于</p>
              <h2>{profile.name}</h2>
              <p>{profile.positioning}</p>
              <p>{profile.bio}</p>
            </div>
          </section>

          <section className="navigation-overlay__contact" id="contact" aria-labelledby="contact-title">
            <div>
              <p className="eyebrow" id="contact-title">CONTACT / 联系</p>
              <p>{profile.email}</p>
            </div>
            <div className="navigation-overlay__qr" aria-label="微信二维码待替换">
              <span>WECHAT QR</span>
              <span>微信二维码待替换</span>
            </div>
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
