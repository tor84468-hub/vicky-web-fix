import { useState } from "react";
import Workspace from "./Workspace.jsx";
import "./workspace.css";
import "./App.css";

// VICKY_WORKSPACE_INTEGRATION

const API_URL = import.meta.env.VITE_API_URL || "/api";

async function vickyApi(path, options = {}) {
  const token = localStorage.getItem("vicky_session_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [modal, setModal] = useState(null);

  if (showWorkspace) {
    return <Workspace />;
  }

  const closeModal = () => setModal(null);

  return (
    <div className="app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="navbar">
        <a className="brand" href="#">
          <span className="brand-mark">V</span>
          <span>Vicky Web Fix</span>
        </a>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#services" onClick={() => setMenuOpen(false)}>Services</a>
          <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#workers" onClick={() => setMenuOpen(false)}>Workers</a>
          <button className="nav-login" onClick={() => setShowWorkspace(true)}>
            Log in
          </button>
          <button className="nav-cta" onClick={() => setShowWorkspace(true)}>
            Get Help
          </button>
        </nav>

        <button
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              WEBSITE SUPPORT PLATFORM
            </div>

            <h1>
              Fix.
              <br />
              <span>Build.</span>
              <br />
              Grow.
            </h1>

            <p>
              Get your website fixed by skilled workers, or join the network
              and earn by solving real website problems.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => setShowWorkspace(true)}>
                Get Website Help
                <span>↗</span>
              </button>

              <button
                className="secondary-btn"
                onClick={() => setShowWorkspace(true)}
              >
                Become a Worker
              </button>

              <button
                className="secondary-btn admin-home-btn"
                onClick={() => {
                  setShowWorkspace(true);
                  window.dispatchEvent(new CustomEvent("vicky-admin-login"));
                }}
              >
                Admin Login
              </button>
            </div>

            <div className="trust-row">
              <div className="avatars">
                <span>V</span>
                <span>W</span>
                <span>+</span>
              </div>
              <div>
                <strong>Built for real work</strong>
                <small>Customers and workers in one platform</small>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-window">
              <div className="window-top">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>Vicky Web Fix</span>
                <div className="window-profile">V</div>
              </div>

              <div className="dashboard-body">
                <aside className="dashboard-sidebar">
                  <div className="side-logo">
                    <span>V</span>
                  </div>
                  <div className="side-item active">⌂</div>
                  <div className="side-item">▣</div>
                  <div className="side-item">◈</div>
                  <div className="side-item">◎</div>
                  <div className="side-bottom">⚙</div>
                </aside>

                <div className="dashboard-main">
                  <div className="dash-heading">
                    <div>
                      <small>WORKSPACE</small>
                      <h3>Website Jobs</h3>
                    </div>
                    <button>+ New Request</button>
                  </div>

                  <div className="stats-grid">
                    <div className="mini-stat">
                      <span>Active Jobs</span>
                      <strong>24</strong>
                      <em>+12.5%</em>
                    </div>
                    <div className="mini-stat">
                      <span>Completed</span>
                      <strong>186</strong>
                      <em>+8.4%</em>
                    </div>
                    <div className="mini-stat">
                      <span>Workers</span>
                      <strong>58</strong>
                      <em>+16.2%</em>
                    </div>
                  </div>

                  <div className="board">
                    <div className="board-column">
                      <div className="column-title">
                        <span>NEW REQUESTS</span>
                        <b>3</b>
                      </div>

                      <div className="job-card">
                        <div className="job-icon purple">W</div>
                        <div>
                          <strong>Fix broken homepage</strong>
                          <small>WordPress · High priority</small>
                        </div>
                      </div>

                      <div className="job-card">
                        <div className="job-icon blue">S</div>
                        <div>
                          <strong>Repair mobile layout</strong>
                          <small>React · Medium priority</small>
                        </div>
                      </div>
                    </div>

                    <div className="board-column">
                      <div className="column-title">
                        <span>IN PROGRESS</span>
                        <b>2</b>
                      </div>

                      <div className="job-card active-job">
                        <div className="job-icon cyan">A</div>
                        <div>
                          <strong>API connection issue</strong>
                          <small>Node.js · Assigned</small>
                        </div>
                        <span className="status-dot" />
                      </div>

                      <div className="worker-card">
                        <div className="worker-avatar">W</div>
                        <div>
                          <strong>Worker assigned</strong>
                          <small>Working on your request</small>
                        </div>
                        <span>›</span>
                      </div>
                    </div>

                    <div className="board-column done-column">
                      <div className="column-title">
                        <span>COMPLETED</span>
                        <b>8</b>
                      </div>

                      <div className="completed-card">
                        <div className="check">✓</div>
                        <div>
                          <strong>SSL certificate fix</strong>
                          <small>Completed 12 min ago</small>
                        </div>
                      </div>

                      <div className="completed-card">
                        <div className="check">✓</div>
                        <div>
                          <strong>Speed optimization</strong>
                          <small>Completed 34 min ago</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="floating-card request-float">
              <div className="float-icon">⚡</div>
              <div>
                <strong>New job received</strong>
                <small>Website repair request</small>
              </div>
              <span className="green-check">✓</span>
            </div>

            <div className="floating-card earning-float">
              <small>WORKER EARNINGS</small>
              <span>+18.4% this month</span>
              <div className="chart">
                <i /><i /><i /><i /><i /><i /><i /><i />
              </div>
            </div>
          </div>
        </section>

        <section className="metrics">
          <div><strong>500+</strong><span>Website fixes</span></div>
          <div><strong>100+</strong><span>Skilled workers</span></div>
          <div><strong>24/7</strong><span>Job requests</span></div>
          <div><strong>98%</strong><span>Successful delivery</span></div>
        </section>

        <section className="section" id="services">
          <div className="section-heading">
            <div>
              <span className="section-label">WHAT WE DO</span>
              <h2>Everything your website needs.</h2>
            </div>
            <p>
              From quick fixes to complete development, connect with the right
              worker for the job.
            </p>
          </div>

          <div className="service-grid">
            <article className="service-card large">
              <div className="service-number">01</div>
              <div className="service-icon">⌘</div>
              <h3>Website Repairs</h3>
              <p>
                Broken pages, errors, crashes, bugs and technical problems.
                Get them fixed quickly.
              </p>
              <span className="service-arrow">↗</span>
            </article>

            <article className="service-card">
              <div className="service-number">02</div>
              <div className="service-icon">◈</div>
              <h3>Web Development</h3>
              <p>Build modern websites and powerful web applications.</p>
              <span className="service-arrow">↗</span>
            </article>

            <article className="service-card">
              <div className="service-number">03</div>
              <div className="service-icon">◉</div>
              <h3>Speed & Security</h3>
              <p>Optimize performance, security, hosting and reliability.</p>
              <span className="service-arrow">↗</span>
            </article>

            <article className="service-card">
              <div className="service-number">04</div>
              <div className="service-icon">✦</div>
              <h3>Design & Updates</h3>
              <p>Upgrade your website with a cleaner and modern experience.</p>
              <span className="service-arrow">↗</span>
            </article>
          </div>
        </section>

        <section className="workflow section" id="how">
          <div className="section-heading centered">
            <span className="section-label">SIMPLE WORKFLOW</span>
            <h2>From problem to solution.</h2>
            <p>Three simple steps. No complicated process.</p>
          </div>

          <div className="steps">
            <div className="step">
              <span>01</span>
              <div className="step-icon">+</div>
              <h3>Post a Job</h3>
              <p>Tell us what is wrong with your website or what you want built.</p>
            </div>

            <div className="step-line" />

            <div className="step">
              <span>02</span>
              <div className="step-icon">◌</div>
              <h3>Get Matched</h3>
              <p>A suitable worker receives the job and starts working.</p>
            </div>

            <div className="step-line" />

            <div className="step">
              <span>03</span>
              <div className="step-icon">✓</div>
              <h3>Get It Done</h3>
              <p>Your website gets fixed, built or improved.</p>
            </div>
          </div>
        </section>

        <section className="worker-section section" id="workers">
          <div className="worker-panel">
            <div className="worker-copy">
              <span className="section-label">FOR DEVELOPERS</span>
              <h2>Turn your skills into income.</h2>
              <p>
                Join the Vicky Web Fix worker network. Receive real website
                jobs, complete them and earn money.
              </p>

              <button className="primary-btn" onClick={() => setShowWorkspace(true)}>
                Join the Worker Network <span>↗</span>
              </button>

              <div className="worker-points">
                <span>✓ Choose jobs</span>
                <span>✓ Work remotely</span>
                <span>✓ Build your reputation</span>
              </div>
            </div>

            <div className="worker-visual">
              <div className="income-card">
                <small>THIS MONTH</small>
                <span>Worker earnings</span>
                <div className="income-line">
                  <i /><i /><i /><i /><i /><i /><i /><i /><i />
                </div>
              </div>

              <div className="worker-badge">
                <div className="big-avatar">V</div>
                <div>
                  <strong>Verified Worker</strong>
                  <small>Top rated · 4.9 ★</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div>
            <span className="section-label">READY TO START?</span>
            <h2>Let's fix your website.</h2>
            <p>Post your problem and get the right person on it.</p>
          </div>

          <button className="primary-btn" onClick={() => setShowWorkspace(true)}>
            Get Website Help <span>↗</span>
          </button>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <span className="brand-mark">V</span>
          <div>
            <strong>Vicky Web Fix</strong>
            <small>Website support marketplace</small>
          </div>
        </div>

        <div className="footer-links">
          <a href="#services">Services</a>
          <a href="#how">How It Works</a>
          <a href="#workers">Workers</a>
        </div>

        <span className="copyright">© 2026 Vicky Web Fix</span>
      </footer>

      {modal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            {modal === "help" && (
              <>
                <span className="section-label">CUSTOMER REQUEST</span>
                <h2>Tell us what needs fixing.</h2>
                <p>Submit your website problem and get connected with a worker.</p>
                <input placeholder="Your name" />
                <input placeholder="Email address" type="email" />
                <input placeholder="Website URL" />
                <textarea placeholder="Describe the problem..." rows="5" />
                <button className="primary-btn full" onClick={closeModal}>
                  Submit Request <span>↗</span>
                </button>
              </>
            )}

            {modal === "worker" && (
              <>
                <span className="section-label">WORKER NETWORK</span>
                <h2>Become a Vicky Web Fix worker.</h2>
                <p>Join the network and start receiving website jobs.</p>
                <input placeholder="Full name" />
                <input placeholder="Email address" type="email" />
                <input placeholder="Main skill" />
                <textarea placeholder="Tell us about your experience..." rows="4" />
                <button className="primary-btn full" onClick={closeModal}>
                  Apply as Worker <span>↗</span>
                </button>
              </>
            )}

            {modal === "login" && (
              <>
                <span className="section-label">ACCOUNT</span>
                <h2>Welcome back.</h2>
                <p>Log in to manage your jobs and requests.</p>
                <input placeholder="Email address" type="email" />
                <input placeholder="Password" type="password" />
                <button className="primary-btn full" onClick={closeModal}>
                  Log In <span>↗</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
