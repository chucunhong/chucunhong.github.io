import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { WebIcon, MLIcon, CodeIcon, GitHubIcon, GoogleScholarIcon, EmailIcon } from '../components/Icons';
import CalendarBadge from '../components/CalendarBadge';
import avatarImage from '../assets/Homepage_avatar.png';
import './Home.css';

// Code-split the 3D hero (three.js/@react-three) out of the main bundle so
// only the Home route pays for it — other pages never download it.
const Hero3D = lazy(() => import('../components/hero3d/Hero3D'));

function Home() {
  return (
    <div className="home-page">
      <section className="hero3d-banner">
        <Suspense fallback={<div className="hero3d-outer-fallback" aria-hidden="true" />}>
          <Hero3D avatarSrc={avatarImage} />
        </Suspense>
      </section>

      <section className="hero-section">
        <div className="hero-text">
          <h1 className="hero-greeting">Hello, I'm <span className="name-highlight">Thang Doan</span></h1>
          <p className="hero-description">
            Currently I'm an <strong>independent researcher</strong> and an <strong>AI engineer</strong> at Secomus Technology JSC | Hanoi, Vietnam.
            I am driven by the belief that technology’s true value lies in its ability to address real-world challenges,
            particularly in improving decision-making processes. My interests focus on bridging the gap between technological
            innovation and practical application by applying cutting-edge technologies such as machine learning and artificial
            intelligences, with a strong emphasis on the Finance domain.
          </p>
          <div className="hero-links">
            <a href="https://github.com/thangdv509" target="_blank" rel="noopener noreferrer" className="hero-link">
              <GitHubIcon className="hero-link-icon" />
              <span>GitHub</span>
            </a>
            <a href="https://scholar.google.com/citations?view_op=list_works&hl=en&hl=en&user=Oi6ma9wAAAAJ&sortby=pubdate" target="_blank" rel="noopener noreferrer" className="hero-link">
              <GoogleScholarIcon className="hero-link-icon" />
              <span>Google Scholar</span>
            </a>
            <a href="mailto:thang.dv509@gmail.com" className="hero-link">
              <EmailIcon className="hero-link-icon" />
              <span>Email</span>
            </a>
          </div>
        </div>
      </section>

      <section className="home-section" id="research-interests">
        <h2 className="section-heading">Research Interests</h2>
        <p className="section-intro">
          My research interests span Machine Learning (ML) and <strong>Large Language Models (LLMs)</strong>, with a focus on <strong>trustworthy AI</strong> and <strong>safety AI</strong>. Recently, I have been exploring synthetic data generation (especially for tabular data with LLMs).
        </p>
        <div className="interests-grid">
          <div className="interest-card">
            <div className="interest-icon">
              <MLIcon />
            </div>
            <h3>Large Language Models</h3>
          </div>
          <div className="interest-card">
            <div className="interest-icon">
              <WebIcon />
            </div>
            <h3>Trustworthy AI</h3>
          </div>
          <div className="interest-card">
            <div className="interest-icon">
              <CodeIcon />
            </div>
            <h3>Safety AI</h3>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-heading">Education</h2>
        <div className="education-item">
          <div className="education-year">
            <span>Sep 2019 – Apr 2024</span>
          </div>
          <div className="education-details">
            <h3>B.S. in Computer Science</h3>
            <p>Hanoi University of Science and Technology | Hanoi | Vietnam</p>
            <p className="education-note">CPA: 3.66/4.0</p>
            <p className="education-note">Thesis: ZKP-based protocol connecting traditional finance to decentralized finance. (Grade: 9.6/10)</p>
          </div>
        </div>

        <div className="education-item">
          <div className="education-year">
            <span>Sep 2021 - Apr 2025</span>
          </div>
          <div className="education-details">
            <h3>B.S. in Finance</h3>
            <p>Banking Academy | Hanoi | Vietnam </p>
            <p className="education-note">CPA: 3.73/4.0</p>
            <p className="education-note">Thesis: The impact of financial distress on earnings management of firms in Vietnam. (Grade: 9.3/10)</p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2 className="section-heading">Services</h2>
        <ul className="service-list">
          <li>Mentor Cohort 2 Vingroup AI thực chiến</li>
          <li>Mentor Cohort 3 Vingroup AI thực chiến</li>
        </ul>
      </section>

      <section className="home-section" id="news-updates">
        <h2 className="section-heading">News & Updates</h2>
        <ul className="news-list">
          <li>
            <CalendarBadge date="22 Sep 2026" />
            <span className="news-content">My paper titled <strong>"Fair Synthetic Tabular Data Generation via Disentangled Semantic Encoding and Large Language Models"</strong> in collaboration with <i>Mrs. Huyen Giang Thi Thu</i>  and <i>Mr. Tai Le Quy</i>  has been accepted for Discover Artificial Intelligence (Q1)!</span>
          </li>
          <li>
            <CalendarBadge date="17 Aug 2026" />
            <span className="news-content">Took a short <strong>healing trip to Sapa</strong> on 16–17 Aug 2026 to clear my head before starting my PhD journey — check out the photos in the <Link to="/travel">Travel</Link> section!</span>
          </li>
          <li>
            <CalendarBadge date="17 Jun 2026" />
            <span className="news-content">My paper titled <strong>"The impact of financial distress on earnings management: Evidence from Vietnam"</strong> in collaboration with <i>Mrs. Trang Do Thi Van</i> has been accepted for Investment Management and Financial Innovations (Q3)! This is a great motivation for me to continue publishing more high-quality articles in the field of Finance in the future.</span>
          </li>
          <li>
            <CalendarBadge date="28 May 2026" />
            <span className="news-content">My paper titled <strong>"An Experimental Study on Fairness-aware Machine Learning for Credit Scoring Problems"</strong> in collaboration with <i>Mrs. Huyen Giang Thi Thu</i>  and <i>Mr. Tai Le Quy</i>  has been accepted for Digital Finance (Q2)!</span>
          </li>
          <li>
            <CalendarBadge date="Jan 2026" />
            <span className="news-content">Welcome to my webpage! I'm exicited to share my research and work with you 🤩🤩🤩</span>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default Home;
