import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "/api";

const WHATSAPP = "2290191649798";

const SKILLS = [
  "HTML / CSS",
  "JavaScript",
  "React",
  "Node.js",
  "Python",
  "WordPress",
  "Website Repair",
  "Mobile Fixes",
  "UI / UX",
];

function whatsapp(message) {
  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
  const [page, setPage] = useState("home");
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem("vicky_session_token");
    const user = localStorage.getItem("vicky_session_user");

    return {
      token: token || "",
      user: user ? JSON.parse(user) : null,
    };
  });

  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("customer");

  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [jobForm, setJobForm] = useState({
    title: "",
    websiteUrl: "",
    description: "",
    requiredSkills: [],
  });

  const [jobs, setJobs] = useState([]);
  const [workerJobs, setWorkerJobs] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [balance, setBalance] = useState(0);

  const [payoutForm, setPayoutForm] = useState({
    amount: "",
    method: "",
    accountDetails: "",
  });

  const [adminStats, setAdminStats] = useState(null);
  const [adminJobs, setAdminJobs] = useState([]);
  const [adminWorkers, setAdminWorkers] = useState([]);
  const [adminPayouts, setAdminPayouts] = useState([]);

  const [workerForm, setWorkerForm] = useState({
    name: "",
    email: "",
    password: "",
    skills: [],
  });

  useEffect(() => {
    if (!session.token) return;

    apiRequest("/auth/me", {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }).then((data) => {
      const user = data.user;

      localStorage.setItem(
        "vicky_session_user",
        JSON.stringify(user)
      );

      setSession((current) => ({
        ...current,
        user,
      }));
    }).catch(() => {
      logout();
    });
  }, []);

  function saveSession(data) {
    localStorage.setItem("vicky_session_token", data.token);
    localStorage.setItem(
      "vicky_session_user",
      JSON.stringify(data.user)
    );

    setSession({
      token: data.token,
      user: data.user,
    });

    setNotice("");
  }

  function logout() {
    localStorage.removeItem("vicky_session_token");
    localStorage.removeItem("vicky_session_user");

    setSession({
      token: "",
      user: null,
    });

    setPage("home");
    setNotice("");
  }

  function go(pageName) {
    setNotice("");
    setPage(pageName);
  }

  async function handleAuth(event) {
    event.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      const endpoint =
        authMode === "login"
          ? "/auth/login"
          : "/auth/register";

      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify({
          ...authForm,
          role: authRole,
        }),
      });

      saveSession(data);

      if (data.user?.role === "admin") {
        go("admin");
      } else if (data.user?.role === "worker") {
        go("worker");
      } else {
        go("customer");
      }

      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleWorkerRegister(event) {
    event.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      const data = await apiRequest("/workers/register", {
        method: "POST",
        body: JSON.stringify(workerForm),
      });

      localStorage.setItem(
        "vicky_session_token",
        data.token
      );

      localStorage.setItem(
        "vicky_session_user",
        JSON.stringify({
          name: data.worker.name,
          email: data.worker.email,
          role: "worker",
          status: data.worker.status,
        })
      );

      setSession({
        token: data.token,
        user: {
          name: data.worker.name,
          email: data.worker.email,
          role: "worker",
          status: data.worker.status,
        },
      });

      setWorkerForm({
        name: "",
        email: "",
        password: "",
        skills: [],
      });

      go("worker");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCustomerJobs() {
    if (!session.token) return;

    try {
      const data = await apiRequest("/jobs/my", {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      setJobs(data.jobs || []);
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function loadWorkerData() {
    if (!session.token) return;

    try {
      const [profile, available, active, earningsData] =
        await Promise.all([
          apiRequest("/workers/me", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
          apiRequest("/jobs/available", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
          apiRequest("/jobs/worker", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
          apiRequest("/earnings", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
        ]);

      setWorkerJobs([
        ...(available.jobs || []).map((job) => ({
          ...job,
          source: "available",
        })),
        ...(active.jobs || []).map((job) => ({
          ...job,
          source: "active",
        })),
      ]);

      setBalance(Number(earningsData.balance || 0));
      setEarnings(earningsData.earnings || []);

      localStorage.setItem(
        "vicky_worker_profile",
        JSON.stringify(profile.worker)
      );
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function loadAdminData() {
    if (!session.token) return;

    try {
      const [stats, jobData, workerData, payoutData] =
        await Promise.all([
          apiRequest("/admin/stats", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
          apiRequest("/admin/jobs", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
          apiRequest("/admin/workers", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
          apiRequest("/admin/payouts", {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }),
        ]);

      setAdminStats(stats);
      setAdminJobs(jobData.jobs || []);
      setAdminWorkers(workerData.workers || []);
      setAdminPayouts(payoutData.payouts || []);
    } catch (error) {
      setNotice(error.message);
    }
  }

  useEffect(() => {
    if (!session.user) return;

    if (session.user.role === "customer") {
      loadCustomerJobs();
    }

    if (session.user.role === "worker") {
      loadWorkerData();
    }

    if (session.user.role === "admin") {
      loadAdminData();
    }
  }, [page, session.user]);

  async function submitJob(event) {
    event.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      await apiRequest("/jobs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(jobForm),
      });

      setJobForm({
        title: "",
        websiteUrl: "",
        description: "",
        requiredSkills: [],
      });

      setNotice(
        "Your website repair request has been submitted for review."
      );

      await loadCustomerJobs();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function workerAction(jobId, action, body = {}) {
    setLoading(true);
    setNotice("");

    try {
      await apiRequest(`/jobs/${jobId}/${action}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(body),
      });

      await loadWorkerData();
      setNotice("Job updated successfully.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function approveCompletion(jobId) {
    setLoading(true);
    setNotice("");

    try {
      await apiRequest(`/jobs/${jobId}/approve-completion`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      await loadCustomerJobs();
      setNotice("Completion approved.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPayout(event) {
    event.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      await apiRequest("/payouts", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          amount: Number(payoutForm.amount),
          method: payoutForm.method,
          accountDetails: payoutForm.accountDetails,
        }),
      });

      setPayoutForm({
        amount: "",
        method: "",
        accountDetails: "",
      });

      await loadWorkerData();

      setNotice(
        "Payout request submitted for admin processing."
      );
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function adminAction(
    endpoint,
    method = "PATCH",
    body = {}
  ) {
    setLoading(true);
    setNotice("");

    try {
      await apiRequest(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(body),
      });

      await loadAdminData();
      setNotice("Admin action completed.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleSkill(current, setter, skill) {
    setter((form) => ({
      ...form,
      skills: form.skills.includes(skill)
        ? form.skills.filter((item) => item !== skill)
        : [...form.skills, skill],
    }));
  }

  function toggleJobSkill(skill) {
    setJobForm((form) => ({
      ...form,
      requiredSkills: form.requiredSkills.includes(skill)
        ? form.requiredSkills.filter(
            (item) => item !== skill
          )
        : [...form.requiredSkills, skill],
    }));
  }

  const user = session.user;

  return (
    <div className="app-shell">
      <header className="navbar">
        <div
          className="logo"
          onClick={() => go("home")}
          style={{ cursor: "pointer" }}
        >
          Vicky Web Fix
        </div>

        <nav>
          <button
            className="nav-link"
            onClick={() => go("home")}
          >
            Home
          </button>

          {user?.role === "customer" && (
            <>
              <button
                className="nav-link"
                onClick={() => go("customer")}
              >
                My Jobs
              </button>
              <button
                className="nav-link"
                onClick={() => go("new-job")}
              >
                Submit Job
              </button>
            </>
          )}

          {user?.role === "worker" && (
            <button
              className="nav-link"
              onClick={() => go("worker")}
            >
              Worker Dashboard
            </button>
          )}

          {user?.role === "admin" && (
            <button
              className="nav-link"
              onClick={() => go("admin")}
            >
              Admin
            </button>
          )}

          {!user && (
            <>
              <button
                className="nav-link"
                onClick={() => {
                  setAuthRole("customer");
                  setAuthMode("login");
                  go("auth");
                }}
              >
                Login
              </button>

              <button
                className="nav-link"
                onClick={() => {
                  setAuthRole("worker");
                  setAuthMode("register");
                  go("worker-register");
                }}
              >
                Become a Worker
              </button>
            </>
          )}

          {user && (
            <button className="nav-link" onClick={logout}>
              Logout
            </button>
          )}
        </nav>
      </header>

      {notice && (
        <div className="notice">
          {notice}
        </div>
      )}

      {page === "home" && (
        <main className="home-page">

          <section className="hero hero-premium">
            <div className="hero-copy">
              <div className="hero-badge">
                <span className="live-dot"></span>
                WEBSITE SUPPORT PLATFORM
              </div>

              <h1>
                We fix websites.
                <br />
                <span>Workers build the future.</span>
              </h1>

              <p className="hero-lead">
                Vicky Web Fix connects people and businesses
                who need website help with skilled workers who
                are ready to get the job done.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => {
                    if (!user) {
                      setAuthRole("customer");
                      setAuthMode("register");
                      go("auth");
                    } else {
                      go("new-job");
                    }
                  }}
                >
                  Get Website Help
                </button>

                <button
                  className="secondary-button"
                  onClick={() => go("worker-register")}
                >
                  Join as a Worker
                </button>
              </div>

              <div className="hero-trust">
                <span>✓ Free initial inspection</span>
                <span>✓ Skilled workers</span>
                <span>✓ WhatsApp support</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow"></div>

              <div className="system-card">
                <div className="system-top">
                  <div>
                    <small>VICKY WEB FIX</small>
                    <h3>Website Support</h3>
                  </div>
                  <span className="status-pill">
                    <i></i> Online
                  </span>
                </div>

                <div className="system-screen">
                  <div className="screen-label">
                    WEBSITE STATUS
                  </div>

                  <div className="screen-status">
                    <span className="status-circle">
                      ✓
                    </span>

                    <div>
                      <strong>Ready for inspection</strong>
                      <p>
                        Submit your website problem and
                        we'll identify the next step.
                      </p>
                    </div>
                  </div>

                  <div className="screen-lines">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>

                <div className="system-bottom">
                  <span>Customer</span>
                  <span>→</span>
                  <span>Vicky Web Fix</span>
                  <span>→</span>
                  <span>Worker</span>
                </div>
              </div>
            </div>
          </section>

          <section className="platform-strip">
            <div>
              <strong>ONE PLATFORM</strong>
              <span>Customers</span>
            </div>
            <div className="strip-arrow">→</div>
            <div>
              <strong>REAL PROJECTS</strong>
              <span>Website Jobs</span>
            </div>
            <div className="strip-arrow">→</div>
            <div>
              <strong>SKILLED WORKERS</strong>
              <span>Remote Opportunities</span>
            </div>
            <div className="strip-arrow">→</div>
            <div>
              <strong>COMPLETED WORK</strong>
              <span>Better Websites</span>
            </div>
          </section>

          <section className="section intro-section">
            <div className="section-heading centered">
              <span className="eyebrow">THE PLATFORM</span>
              <h2>Website problems meet skilled people.</h2>
              <p>
                Whether you need a website fixed or you're
                looking for opportunities to use your skills,
                Vicky Web Fix brings both sides together.
              </p>
            </div>

            <div className="role-cards">
              <article className="role-card customer-card">
                <div className="role-number">01</div>
                <div className="role-icon">◈</div>
                <span className="eyebrow">FOR CUSTOMERS</span>
                <h3>Get your website working again.</h3>
                <p>
                  Submit your website problem, let the
                  platform organize the work, and review
                  the completed result.
                </p>

                <button
                  className="text-button"
                  onClick={() => {
                    if (!user) {
                      setAuthRole("customer");
                      setAuthMode("register");
                      go("auth");
                    } else {
                      go("new-job");
                    }
                  }}
                >
                  Start a Website Request →
                </button>
              </article>

              <article className="role-card worker-card">
                <div className="role-number">02</div>
                <div className="role-icon">◇</div>
                <span className="eyebrow">FOR WORKERS</span>
                <h3>Turn your skills into opportunities.</h3>
                <p>
                  Build your worker profile, get approved,
                  discover available projects and complete
                  website jobs remotely.
                </p>

                <button
                  className="text-button"
                  onClick={() => go("worker-register")}
                >
                  Become a Worker →
                </button>
              </article>

              <article className="role-card admin-card">
                <div className="role-number">03</div>
                <div className="role-icon">▣</div>
                <span className="eyebrow">FOR ADMINS</span>
                <h3>Keep projects moving.</h3>
                <p>
                  Review submitted projects, approve workers,
                  monitor activity and manage the marketplace.
                </p>

                <button
                  className="text-button"
                  onClick={() => {
                    setAuthRole("customer");
                    setAuthMode("login");
                    go("auth");
                  }}
                >
                  Admin Login →
                </button>
              </article>
            </div>
          </section>

          <section className="section dark-section marketplace-section">
            <div className="section-heading centered">
              <span className="eyebrow">HOW IT WORKS</span>
              <h2>From problem to completed work.</h2>
              <p>
                A simple workflow designed to keep customers,
                workers and administrators connected.
              </p>
            </div>

            <div className="process-grid">
              <div className="process-step">
                <span>01</span>
                <div className="process-line"></div>
                <h3>Submit</h3>
                <p>
                  A customer tells us what is wrong with
                  their website.
                </p>
              </div>

              <div className="process-step">
                <span>02</span>
                <div className="process-line"></div>
                <h3>Review</h3>
                <p>
                  The project is checked before becoming
                  available to approved workers.
                </p>
              </div>

              <div className="process-step">
                <span>03</span>
                <div className="process-line"></div>
                <h3>Work</h3>
                <p>
                  A qualified worker accepts the project
                  and completes the requested work.
                </p>
              </div>

              <div className="process-step">
                <span>04</span>
                <div className="process-line"></div>
                <h3>Approve</h3>
                <p>
                  The customer reviews the completed work
                  before the project is finalized.
                </p>
              </div>
            </div>
          </section>

          <section className="section services-section">
            <div className="section-heading">
              <span className="eyebrow">OUR SERVICES</span>
              <h2>Built around real website problems.</h2>
              <p>
                Get help with the technical issues that
                keep your website from performing properly.
              </p>
            </div>

            <div className="service-grid">
              <article className="service-card">
                <span className="service-index">01</span>
                <h3>Bug Fixes</h3>
                <p>
                  Broken pages, errors, forms, buttons and
                  other website functionality problems.
                </p>
              </article>

              <article className="service-card">
                <span className="service-index">02</span>
                <h3>Mobile Fixes</h3>
                <p>
                  Responsive layouts, mobile usability and
                  display problems across different screens.
                </p>
              </article>

              <article className="service-card">
                <span className="service-index">03</span>
                <h3>Landing Pages</h3>
                <p>
                  Clean, modern landing pages designed to
                  communicate your message clearly.
                </p>
              </article>

              <article className="service-card">
                <span className="service-index">04</span>
                <h3>Deployment</h3>
                <p>
                  Help getting your website online,
                  connected and working correctly.
                </p>
              </article>
            </div>
          </section>

          <section className="section worker-banner">
            <div className="worker-banner-content">
              <span className="eyebrow">FOR SKILLED WORKERS</span>
              <h2>Your skills deserve real opportunities.</h2>
              <p>
                Join the Vicky Web Fix worker network and
                build your profile around the skills you know.
              </p>

              <div className="worker-points">
                <span>✓ Create your profile</span>
                <span>✓ Get approved</span>
                <span>✓ Find available projects</span>
                <span>✓ Complete work remotely</span>
              </div>

              <button
                className="primary-button"
                onClick={() => go("worker-register")}
              >
                Become a Worker
              </button>
            </div>

            <div className="worker-decoration">
              <div className="decoration-card">
                <small>WORKER NETWORK</small>
                <strong>SKILLS → PROJECTS</strong>
                <span>Build. Work. Grow.</span>
              </div>
            </div>
          </section>

          <section className="section support-section">
            <div className="support-box">
              <div>
                <span className="eyebrow">NEED HELP?</span>
                <h2>Not sure what's wrong with your website?</h2>
                <p>
                  Tell us what you're seeing. We'll help you
                  understand the problem and identify the next
                  step.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() =>
                  whatsapp(
                    "Hello Vicky Web Fix, I need help with my website."
                  )
                }
              >
                Contact Support
              </button>
            </div>
          </section>

        </main>
      )}

      {page === "auth" && (
        <main className="dashboard-page">
          <section className="auth-card">
            <span className="eyebrow">
              {authRole === "customer"
                ? "CUSTOMER ACCOUNT"
                : "ACCOUNT LOGIN"}
            </span>

            <h1>
              {authMode === "login"
                ? "Welcome back."
                : "Create your account."}
            </h1>

            <div className="auth-tabs">
              <button
                className={
                  authMode === "login"
                    ? "active"
                    : ""
                }
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>

              <button
                className={
                  authMode === "register"
                    ? "active"
                    : ""
                }
                onClick={() => setAuthMode("register")}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleAuth}>
              {authMode === "register" && (
                <label>
                  Name
                  <input
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({
                        ...authForm,
                        name: e.target.value,
                      })
                    }
                    required
                  />
                </label>
              )}

              <label>
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({
                      ...authForm,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <button
                className="primary-button full"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : authMode === "login"
                  ? "Login"
                  : "Create Account"}
              </button>
            </form>

            <p className="muted">
              Need worker access?{" "}
              <button
                className="inline-button"
                onClick={() => go("worker-register")}
              >
                Become a Worker
              </button>
            </p>
          </section>
        </main>
      )}

      {page === "worker-register" && (
        <main className="dashboard-page">
          <section className="auth-card wide">
            <span className="eyebrow">
              FOR DEVELOPERS & TECH WORKERS
            </span>

            <h1>
              Turn your skills into opportunities.
            </h1>

            <p>
              Create a worker account and wait for
              admin approval before accepting projects.
            </p>

            <form onSubmit={handleWorkerRegister}>
              <label>
                Full name
                <input
                  value={workerForm.name}
                  onChange={(e) =>
                    setWorkerForm({
                      ...workerForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={workerForm.email}
                  onChange={(e) =>
                    setWorkerForm({
                      ...workerForm,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  minLength="6"
                  value={workerForm.password}
                  onChange={(e) =>
                    setWorkerForm({
                      ...workerForm,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <div className="field-group">
                <strong>Your skills</strong>

                <div className="skill-grid">
                  {SKILLS.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      className={
                        workerForm.skills.includes(skill)
                          ? "skill selected"
                          : "skill"
                      }
                      onClick={() =>
                        toggleSkill(
                          workerForm.skills,
                          setWorkerForm,
                          skill
                        )
                      }
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="primary-button full"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Create Worker Account"}
              </button>
            </form>
          </section>
        </main>
      )}

      {page === "new-job" && user?.role === "customer" && (
        <main className="dashboard-page">
          <section className="form-card">
            <span className="eyebrow">
              CUSTOMER REQUEST
            </span>

            <h1>Submit a website job.</h1>

            <p>
              Describe the problem clearly so the
              project can be reviewed.
            </p>

            <form onSubmit={submitJob}>
              <label>
                Job title
                <input
                  placeholder="Example: Fix broken contact form"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      title: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Website URL
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={jobForm.websiteUrl}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      websiteUrl: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                Describe the problem
                <textarea
                  rows="7"
                  value={jobForm.description}
                  onChange={(e) =>
                    setJobForm({
                      ...jobForm,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <div className="field-group">
                <strong>
                  Skills that may be required
                </strong>

                <div className="skill-grid">
                  {SKILLS.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      className={
                        jobForm.requiredSkills.includes(
                          skill
                        )
                          ? "skill selected"
                          : "skill"
                      }
                      onClick={() =>
                        toggleJobSkill(skill)
                      }
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="primary-button"
                disabled={loading}
              >
                {loading
                  ? "Submitting..."
                  : "Submit Website Job"}
              </button>
            </form>
          </section>
        </main>
      )}

      {page === "customer" && user?.role === "customer" && (
        <main className="dashboard-page">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">
                CUSTOMER DASHBOARD
              </span>
              <h1>
                Welcome, {user.name || "Customer"}.
              </h1>
              <p>
                Track your website repair requests.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => go("new-job")}
            >
              Submit New Job
            </button>
          </div>

          <section className="dashboard-grid">
            <div className="stat-card">
              <strong>{jobs.length}</strong>
              <span>Total Jobs</span>
            </div>

            <div className="stat-card">
              <strong>
                {
                  jobs.filter(
                    (job) =>
                      job.status === "completed"
                  ).length
                }
              </strong>
              <span>Completed</span>
            </div>

            <div className="stat-card">
              <strong>
                {
                  jobs.filter(
                    (job) =>
                      job.status ===
                      "completed_pending_approval"
                  ).length
                }
              </strong>
              <span>Awaiting Approval</span>
            </div>
          </section>

          <section className="list-section">
            <div className="section-heading compact">
              <span className="eyebrow">
                YOUR PROJECTS
              </span>
              <h2>Job activity</h2>
            </div>

            {jobs.length === 0 ? (
              <div className="empty-state">
                <h3>No jobs yet.</h3>
                <p>
                  Submit your first website repair
                  request to get started.
                </p>
                <button
                  className="primary-button"
                  onClick={() => go("new-job")}
                >
                  Submit a Job
                </button>
              </div>
            ) : (
              <div className="job-list">
                {jobs.map((job) => (
                  <article
                    className="job-card"
                    key={job.id}
                  >
                    <div>
                      <span className="status">
                        {job.status}
                      </span>
                      <h3>{job.title}</h3>

                      {job.website_url && (
                        <p>
                          {job.website_url}
                        </p>
                      )}

                      <p>{job.description}</p>

                      {job.completion_message && (
                        <div className="completion-note">
                          <strong>
                            Worker completion message
                          </strong>
                          <p>
                            {job.completion_message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="job-actions">
                      {job.status ===
                        "completed_pending_approval" && (
                        <button
                          className="primary-button"
                          onClick={() =>
                            approveCompletion(job.id)
                          }
                          disabled={loading}
                        >
                          Approve Completion
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {page === "worker" && user?.role === "worker" && (
        <main className="worker-dashboard">
          <div className="worker-shell">

            <aside className="worker-sidebar">
              <div className="worker-brand">
                <div className="worker-brand-mark">V</div>
                <div>
                  <strong>Vicky Web Fix</strong>
                  <span>Worker Portal</span>
                </div>
              </div>

              <nav className="worker-nav">
                <button className="worker-nav-item active">
                  <span>▦</span>
                  Dashboard
                </button>

                <button
                  className="worker-nav-item"
                  onClick={() =>
                    document
                      .getElementById("worker-projects")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <span>◫</span>
                  Projects
                </button>

                <button
                  className="worker-nav-item"
                  onClick={() =>
                    document
                      .getElementById("worker-earnings")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <span>↗</span>
                  Earnings
                </button>

                <button
                  className="worker-nav-item"
                  onClick={() =>
                    document
                      .getElementById("worker-profile")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <span>◯</span>
                  Profile
                </button>
              </nav>

              <div className="worker-sidebar-bottom">
                <div className="worker-mini-profile">
                  <div className="worker-avatar">
                    {(user.name || "W").charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <strong>{user.name || "Worker"}</strong>
                    <span>
                      {user.status === "approved"
                        ? "Verified worker"
                        : "Pending approval"}
                    </span>
                  </div>
                </div>

                <button className="worker-logout" onClick={logout}>
                  Sign out
                </button>
              </div>
            </aside>

            <section className="worker-main">

              <header className="worker-topbar">
                <div>
                  <span className="eyebrow">WORKER WORKSPACE</span>

                  <h1>
                    Welcome back, {user.name || "Worker"}
                  </h1>

                  <p>
                    Manage your projects, track your work and monitor
                    your earnings.
                  </p>
                </div>

                <button
                  className="worker-refresh"
                  onClick={loadWorkerData}
                  disabled={loading}
                >
                  ↻ Refresh
                </button>
              </header>

              <section className="worker-status-card">
                <div className="worker-status-icon">
                  {user.status === "approved" ? "✓" : "!"}
                </div>

                <div className="worker-status-content">
                  <span className="eyebrow">ACCOUNT STATUS</span>

                  <h2>
                    {user.status === "approved"
                      ? "Your worker account is approved"
                      : user.status === "suspended"
                      ? "Your account is suspended"
                      : "Your account is awaiting approval"}
                  </h2>

                  <p>
                    {user.status === "approved"
                      ? "You can now review available projects and accept work that matches your skills."
                      : user.status === "suspended"
                      ? "Your access to worker projects has been temporarily suspended."
                      : "Our team needs to approve your worker profile before you can accept projects."}
                  </p>
                </div>

                <span
                  className={`worker-status-pill ${
                    user.status || "pending"
                  }`}
                >
                  {user.status || "pending"}
                </span>
              </section>

              <section className="worker-metrics">
                <article className="worker-metric-card">
                  <div className="metric-icon">₦</div>

                  <div>
                    <span>Total earnings</span>

                    <strong>
                      {Number(balance || 0).toLocaleString()}
                    </strong>
                  </div>
                </article>

                <article className="worker-metric-card">
                  <div className="metric-icon">◫</div>

                  <div>
                    <span>Active projects</span>

                    <strong>
                      {
                        workerJobs.filter(
                          (job) => job.status === "accepted"
                        ).length
                      }
                    </strong>
                  </div>
                </article>

                <article className="worker-metric-card">
                  <div className="metric-icon">✓</div>

                  <div>
                    <span>Earning records</span>

                    <strong>{earnings.length}</strong>
                  </div>
                </article>
              </section>

              <section
                className="worker-content-card"
                id="worker-projects"
              >
                <div className="worker-section-header">
                  <div>
                    <span className="eyebrow">OPPORTUNITIES</span>

                    <h2>Projects</h2>

                    <p>
                      Review available projects and manage work
                      assigned to you.
                    </p>
                  </div>

                  <span className="worker-count">
                    {workerJobs.length}{" "}
                    {workerJobs.length === 1
                      ? "project"
                      : "projects"}
                  </span>
                </div>

                {workerJobs.length === 0 ? (
                  <div className="worker-empty">
                    <div className="worker-empty-icon">◫</div>

                    <h3>No projects available</h3>

                    <p>
                      New approved projects that match your worker
                      access will appear here.
                    </p>

                    <button
                      className="worker-refresh"
                      onClick={loadWorkerData}
                    >
                      Check again
                    </button>
                  </div>
                ) : (
                  <div className="professional-job-list">
                    {workerJobs.map((job) => (
                      <article
                        className="professional-job-card"
                        key={`${job.id}-${job.source}`}
                      >
                        <div className="job-card-main">
                          <div className="job-card-heading">
                            <span
                              className={`job-status ${
                                job.status
                              }`}
                            >
                              {job.status}
                            </span>

                            <span className="job-id">
                              JOB-{String(job.id).padStart(5, "0")}
                            </span>
                          </div>

                          <h3>{job.title}</h3>

                          {job.website_url && (
                            <p className="job-website">
                              {job.website_url}
                            </p>
                          )}

                          <p className="job-description">
                            {job.description}
                          </p>

                          {Array.isArray(job.required_skills) &&
                            job.required_skills.length > 0 && (
                              <div className="professional-skills">
                                {job.required_skills.map((skill) => (
                                  <span key={skill}>{skill}</span>
                                ))}
                              </div>
                            )}
                        </div>

                        <div className="professional-job-actions">
                          {job.status === "approved" &&
                            job.source === "available" && (
                              <button
                                className="worker-primary-button"
                                onClick={() =>
                                  workerAction(
                                    job.id,
                                    "accept"
                                  )
                                }
                                disabled={loading}
                              >
                                Accept project
                              </button>
                            )}

                          {job.status === "accepted" && (
                            <button
                              className="worker-primary-button"
                              onClick={() => {
                                const message = window.prompt(
                                  "Add a completion message:"
                                );

                                if (message !== null) {
                                  workerAction(
                                    job.id,
                                    "complete",
                                    { message }
                                  );
                                }
                              }}
                              disabled={loading}
                            >
                              Submit completion
                            </button>
                          )}

                          {job.status ===
                            "completed_pending_approval" && (
                            <span className="job-awaiting">
                              Awaiting client approval
                            </span>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section
                className="worker-content-card"
                id="worker-earnings"
              >
                <div className="worker-section-header">
                  <div>
                    <span className="eyebrow">FINANCIALS</span>

                    <h2>Earnings & payout</h2>

                    <p>
                      Review your earnings and submit a payout request.
                    </p>
                  </div>
                </div>

                <div className="worker-financial-grid">
                  <div className="worker-balance-panel">
                    <span>Available earnings</span>

                    <strong>
                      {Number(balance || 0).toLocaleString()}
                    </strong>

                    <small>
                      Your balance updates after approved project
                      completion.
                    </small>
                  </div>

                  <form
                    className="professional-payout-form"
                    onSubmit={submitPayout}
                  >
                    <h3>Request payout</h3>

                    <label>
                      Amount

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Enter amount"
                        value={payoutForm.amount}
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            amount: e.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label>
                      Payout method

                      <input
                        placeholder="Bank transfer, mobile money..."
                        value={payoutForm.method}
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            method: e.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <label>
                      Account details

                      <textarea
                        rows="3"
                        placeholder="Enter the details required to process your payout."
                        value={payoutForm.accountDetails}
                        onChange={(e) =>
                          setPayoutForm({
                            ...payoutForm,
                            accountDetails: e.target.value,
                          })
                        }
                        required
                      />
                    </label>

                    <button
                      className="worker-primary-button"
                      disabled={loading}
                    >
                      Request payout
                    </button>
                  </form>
                </div>

                <div className="worker-history">
                  <div className="worker-history-header">
                    <h3>Earning history</h3>

                    <span>
                      {earnings.length} records
                    </span>
                  </div>

                  {earnings.length === 0 ? (
                    <div className="worker-history-empty">
                      No earnings recorded yet.
                    </div>
                  ) : (
                    <div className="professional-earning-list">
                      {earnings.map((earning) => (
                        <div
                          className="professional-earning-row"
                          key={earning.id}
                        >
                          <div className="earning-icon">
                            +
                          </div>

                          <div className="earning-details">
                            <strong>
                              {earning.description}
                            </strong>

                            <small>
                              {earning.created_at}
                            </small>
                          </div>

                          <strong className="earning-amount">
                            +
                            {Number(
                              earning.amount
                            ).toLocaleString()}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section
                className="worker-profile-card"
                id="worker-profile"
              >
                <div className="worker-profile-avatar">
                  {(user.name || "W")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="worker-profile-info">
                  <span className="eyebrow">
                    WORKER PROFILE
                  </span>

                  <h2>{user.name || "Worker"}</h2>

                  <p>{user.email}</p>

                  <div className="profile-status">
                    <span
                      className={`worker-status-dot ${
                        user.status || "pending"
                      }`}
                    ></span>

                    {user.status === "approved"
                      ? "Verified worker"
                      : "Profile pending approval"}
                  </div>
                </div>

                <div className="worker-profile-note">
                  <strong>Keep your profile professional</strong>

                  <p>
                    Your skills help our team match you with suitable
                    website projects.
                  </p>
                </div>
              </section>

              <footer className="worker-dashboard-footer">
                <span>Vicky Web Fix</span>
                <span>Professional worker platform</span>
              </footer>

            </section>
          </div>
        </main>
      )}
      
      {page === "admin" && user?.role === "admin" && (
        <main className="dashboard-page">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">
                ADMIN CONTROL CENTER
              </span>
              <h1>Marketplace overview.</h1>
              <p>
                Manage workers, projects and payout
                requests.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={loadAdminData}
            >
              Refresh
            </button>
          </div>

          {adminStats && (
            <section className="dashboard-grid">
              <div className="stat-card">
                <strong>
                  {adminStats.users?.count || 0}
                </strong>
                <span>Customers</span>
              </div>

              <div className="stat-card">
                <strong>
                  {adminStats.workers?.count || 0}
                </strong>
                <span>Workers</span>
              </div>

              <div className="stat-card">
                <strong>
                  {adminStats.pendingWorkers?.count ||
                    0}
                </strong>
                <span>Pending Workers</span>
              </div>

              <div className="stat-card">
                <strong>
                  {adminStats.jobs?.count || 0}
                </strong>
                <span>Total Jobs</span>
              </div>

              <div className="stat-card">
                <strong>
                  {adminStats.activeJobs?.count || 0}
                </strong>
                <span>Active Jobs</span>
              </div>

              <div className="stat-card">
                <strong>
                  {adminStats.completedJobs?.count ||
                    0}
                </strong>
                <span>Completed Jobs</span>
              </div>
            </section>
          )}

          <section className="admin-section">
            <div className="section-heading compact">
              <span className="eyebrow">
                WORKERS
              </span>
              <h2>Worker approvals</h2>
            </div>

            <div className="admin-list">
              {adminWorkers.length === 0 ? (
                <div className="empty-state">
                  No workers registered yet.
                </div>
              ) : (
                adminWorkers.map((worker) => (
                  <article
                    className="admin-row"
                    key={worker.id}
                  >
                    <div>
                      <strong>
                        {worker.name}
                      </strong>
                      <p>{worker.email}</p>
                      <div className="skill-tags">
                        {(Array.isArray(
                          worker.skills
                        )
                          ? worker.skills
                          : []
                        ).map((skill) => (
                          <span key={skill}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="admin-actions">
                      <span className="status">
                        {worker.status}
                      </span>

                      {worker.status !==
                        "approved" && (
                        <button
                          className="primary-button small"
                          onClick={() =>
                            adminAction(
                              `/admin/workers/${worker.id}/approve`
                            )
                          }
                          disabled={loading}
                        >
                          Approve
                        </button>
                      )}

                      {worker.status !==
                        "suspended" && (
                        <button
                          className="danger-button small"
                          onClick={() =>
                            adminAction(
                              `/admin/workers/${worker.id}/suspend`
                            )
                          }
                          disabled={loading}
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-section">
            <div className="section-heading compact">
              <span className="eyebrow">
                JOBS
              </span>
              <h2>Project review</h2>
            </div>

            <div className="admin-list">
              {adminJobs.length === 0 ? (
                <div className="empty-state">
                  No jobs submitted yet.
                </div>
              ) : (
                adminJobs.map((job) => (
                  <article
                    className="admin-row"
                    key={job.id}
                  >
                    <div>
                      <span className="status">
                        {job.status}
                      </span>
                      <h3>{job.title}</h3>
                      <p>
                        Customer:{" "}
                        {job.customer_name ||
                          "Unknown"}
                      </p>
                      <p>
                        {job.description}
                      </p>

                      {job.worker_name && (
                        <p>
                          Worker:{" "}
                          {job.worker_name}
                        </p>
                      )}
                    </div>

                    <div className="admin-actions">
                      {job.status ===
                        "pending" && (
                        <button
                          className="primary-button small"
                          onClick={() =>
                            adminAction(
                              `/admin/jobs/${job.id}/approve`
                            )
                          }
                          disabled={loading}
                        >
                          Approve Job
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="admin-section">
            <div className="section-heading compact">
              <span className="eyebrow">
                PAYOUTS
              </span>
              <h2>Worker payout requests</h2>
            </div>

            <div className="admin-list">
              {adminPayouts.length === 0 ? (
                <div className="empty-state">
                  No payout requests yet.
                </div>
              ) : (
                adminPayouts.map((payout) => (
                  <article
                    className="admin-row"
                    key={payout.id}
                  >
                    <div>
                      <span className="status">
                        {payout.status}
                      </span>

                      <h3>
                        {Number(
                          payout.amount
                        ).toLocaleString()}
                      </h3>

                      <p>
                        Worker:{" "}
                        {payout.worker_name}
                      </p>

                      <p>
                        Method: {payout.method}
                      </p>

                      <p>
                        Account:{" "}
                        {payout.account_details}
                      </p>

                      {payout.admin_note && (
                        <p>
                          Note:{" "}
                          {payout.admin_note}
                        </p>
                      )}
                    </div>

                    <div className="admin-actions">
                      {payout.status ===
                        "pending" && (
                        <button
                          className="secondary-button small"
                          onClick={() =>
                            adminAction(
                              `/admin/payouts/${payout.id}`,
                              "PATCH",
                              {
                                status:
                                  "processing",
                              }
                            )
                          }
                          disabled={loading}
                        >
                          Processing
                        </button>
                      )}

                      {payout.status !==
                        "paid" && (
                        <button
                          className="primary-button small"
                          onClick={() =>
                            adminAction(
                              `/admin/payouts/${payout.id}`,
                              "PATCH",
                              {
                                status: "paid",
                              }
                            )
                          }
                          disabled={loading}
                        >
                          Mark Paid
                        </button>
                      )}

                      {payout.status !==
                        "rejected" && (
                        <button
                          className="danger-button small"
                          onClick={() =>
                            adminAction(
                              `/admin/payouts/${payout.id}`,
                              "PATCH",
                              {
                                status:
                                  "rejected",
                              }
                            )
                          }
                          disabled={loading}
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      )}

      <section className="footer-cta">
        <div>
          <span className="eyebrow">
            VICKY WEB FIX
          </span>
          <h2>
            Build, repair and grow your online
            presence.
          </h2>
        </div>

        <button
          className="primary-button"
          onClick={() =>
            whatsapp(
              "Hello Vicky Web Fix, I would like support."
            )
          }
        >
          WhatsApp Support
        </button>
      </section>

      <footer>
        <div>
          <strong>Vicky Web Fix</strong>
          <p>
            Website repair, support and worker
            opportunities.
          </p>
        </div>

        <div>
          <button
            className="text-button"
            onClick={() => go("worker-register")}
          >
            Become a Worker →
          </button>
        </div>

        <small>
          © 2026 Vicky Web Fix
        </small>
      </footer>
    </div>
  );
}

export default App;
