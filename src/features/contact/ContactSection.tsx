import { ArrowIcon } from '../navigation/ArrowIcon';
import { jobProfile } from '../../content/jobProfile';
import './ContactSection.css';

export function ContactSection() {
  return (
    <footer className="contact-section" id="contact" aria-labelledby="contact-title">
      <div className="contact-section__inner">
        <div>
          <p className="contact-section__eyebrow">CONTACT · 求职联系</p>
          <h2 id="contact-title">让下一份内容，<br />从一次交流开始。</h2>
          <p className="contact-section__cities">目标城市 · {jobProfile.cities}</p>
        </div>
        <div className="contact-section__details">
          <p>期待参与内容策划、影像制作与 AI 创作相关工作。</p>
          <ul aria-label="求职方向">
            {jobProfile.roles.map((role) => <li key={role}>{role}</li>)}
          </ul>
          <a className="contact-section__email" href={jobProfile.emailHref}>
            <span>{jobProfile.email}</span><span aria-hidden="true"><ArrowIcon /></span>
          </a>
          <p className="contact-section__note">欢迎通过邮箱交流岗位与作品。</p>
        </div>
      </div>
    </footer>
  );
}
