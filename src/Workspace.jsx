import { useEffect, useState } from "react";
import "./workspace.css";

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

function Workspace() {
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
    const openAdminLogin = () => {
      setAuthRole("admin");
      setAuthMode("login");
      setPage("auth");
      setNotice("");
    };

    window.addEventListener("vicky-admin-login", openAdminLogin);

    return () => {
      window.removeEventListener("vicky-admin-login", openAdminLogin);
    };
  }, []);

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

    if (authRole === "admin" && authMode !== "login") {
      setAuthMode("login");
      setNotice("Admin accounts cannot be registered.");
      return;
    }

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
                className="nav-link admin-login-link"
                onClick={() => {
                  setAuthRole("admin");
                  setAuthMode("login");
                  go("auth");
                }}
              >
                Admin Login
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
        <main>
          <section className="hero">
            <div className="hero-copy">
              <div className="eyebrow">
                WEBSITE REPAIR & SUPPORT
              </div>

              <h1>
                Your website should work for you.
              </h1>

              <p>
                Vicky Web Fix helps businesses,
                creators and individuals solve website
                problems, improve their online presence
                and connect with skilled web workers.
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
                  Get a Free Check
                </button>

                <button
                  className="secondary-button"
                  onClick={() => go("worker-register")}
                >
                  Become a Worker
                </button>
              </div>

              <div className="trust">
                <span>✓ Free initial inspection</span>
                <span>✓ Clear communication</span>
                <span>✓ WhatsApp support</span>
              </div>
            </div>

            <div className="hero-card">
              <div className="repair-icon">
                <span></span>
              </div>

              <div>
                <small>WEBSITE STATUS</small>
                <h3>Ready for inspection</h3>
                <p>
                  Submit your website problem and
                  we'll help identify the next step.
                </p>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <span className="eyebrow">
                ONE PLATFORM
              </span>
              <h2>
                Website help meets skilled workers.
              </h2>
              <p>
                Customers get their website problems
                handled. Skilled workers get genuine
                opportunities to work remotely.
              </p>
            </div>

            <div className="cards">
              <article className="card">
                <h3>For Customers</h3>
                <p>
                  Submit a website problem, track the
                  job and approve the completed work.
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
                  Start a Request →
                </button>
              </article>

              <article className="card">
                <h3>For Workers</h3>
                <p>
                  Build your worker profile, find
                  available projects and complete jobs.
                </p>
                <button
                  className="text-button"
                  onClick={() => go("worker-register")}
                >
                  Join the Network →
                </button>
              </article>

              <article className="card">
                <h3>For Admins</h3>
                <p>
                  Review projects, approve workers,
                  monitor jobs and manage payout requests.
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

          <section className="section dark-section">
            <div className="section-heading">
              <span className="eyebrow">
                HOW IT WORKS
              </span>
              <h2>Two sides. One platform.</h2>
            </div>

            <div className="steps">
              <div>
                <strong>01</strong>
                <h3>Customer submits</h3>
                <p>
                  A website problem is submitted for
                  review.
                </p>
              </div>

              <div>
                <strong>02</strong>
                <h3>Admin reviews</h3>
                <p>
                  The project is checked before it
                  becomes available.
                </p>
              </div>

              <div>
                <strong>03</strong>
                <h3>Worker accepts</h3>
                <p>
                  An approved worker takes an available
                  project.
                </p>
              </div>

              <div>
                <strong>04</strong>
                <h3>Work is completed</h3>
                <p>
                  The customer reviews and approves
                  the completed work.
                </p>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <span className="eyebrow">
                SERVICES
              </span>
              <h2>What we can help with.</h2>
            </div>

            <div className="cards">
              <article className="card">
                <h3>Bug Fixes</h3>
                <p>
                  Broken pages, errors, forms and
                  website functionality.
                </p>
              </article>

              <article className="card">
                <h3>Mobile Fixes</h3>
                <p>
                  Responsive problems and mobile
                  usability issues.
                </p>
              </article>

              <article className="card">
                <h3>Landing Pages</h3>
                <p>
                  Clean, modern pages designed around
                  your goals.
                </p>
              </article>

              <article className="card">
                <h3>Deployment</h3>
                <p>
                  Help getting your website online and
                  working correctly.
                </p>
              </article>
            </div>
          </section>

          <section className="section callout">
            <div>
              <span className="eyebrow">
                NEED HELP?
              </span>
              <h2>
                Not sure what is wrong?
              </h2>
              <p>
                Tell us what you're seeing. We'll help
                you understand the problem before you
                decide what to do next.
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
          </section>
        </main>
      )}

      {page === "auth" && (
        <main className="dashboard-page">
          <section className="auth-card">
            <span className="eyebrow">
              {authRole === "admin"
                ? "ADMIN ACCESS"
                : authRole === "customer"
                ? "CUSTOMER ACCOUNT"
                : "ACCOUNT LOGIN"}
            </span>

            <h1>
              {authRole === "admin"
                ? "Admin Login."
                : authMode === "login"
                ? "Welcome back."
                : "Create your account."}
            </h1>

            {authRole !== "admin" && (
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
            )}

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

            {authRole !== "admin" && (
              <p className="muted">
                Need worker access?{" "}
                <button
                className="inline-button"
                onClick={() => go("worker-register")}
              >
                Become a Worker
              </button>
              </p>
            )}

            {authRole === "admin" && (
              <p className="muted admin-login-note">
                Authorized administrators only.
              </p>
            )}
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
        <main className="dashboard-page">
          <div className="dashboard-header">
            <div>
              <span className="eyebrow">
                WORKER DASHBOARD
              </span>
              <h1>
                Welcome, {user.name || "Worker"}.
              </h1>
              <p>
                Find projects, complete work and track
                your earnings.
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={loadWorkerData}
            >
              Refresh
            </button>
          </div>

          <section className="dashboard-grid">
            <div className="stat-card">
              <strong>
                {balance.toLocaleString()}
              </strong>
              <span>Earnings Balance</span>
            </div>

            <div className="stat-card">
              <strong>
                {
                  workerJobs.filter(
                    (job) =>
                      job.status === "accepted"
                  ).length
                }
              </strong>
              <span>Active Jobs</span>
            </div>

            <div className="stat-card">
              <strong>
                {
                  earnings.length
                }
              </strong>
              <span>Earning Records</span>
            </div>
          </section>

          <section className="status-banner">
            <div>
              <span className="eyebrow">
                WORKER STATUS
              </span>
              <h3>
                {user.status === "approved"
                  ? "Approved — ready for work"
                  : user.status === "suspended"
                  ? "Account suspended"
                  : "Awaiting admin approval"}
              </h3>
            </div>

            <span className="status">
              {user.status || "pending"}
            </span>
          </section>

          <section className="list-section">
            <div className="section-heading compact">
              <span className="eyebrow">
                PROJECTS
              </span>
              <h2>Available & active jobs</h2>
            </div>

            {workerJobs.length === 0 ? (
              <div className="empty-state">
                <h3>No jobs available.</h3>
                <p>
                  New approved projects will appear
                  here when available.
                </p>
              </div>
            ) : (
              <div className="job-list">
                {workerJobs.map((job) => (
                  <article
                    className="job-card"
                    key={`${job.id}-${job.source}`}
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

                      {job.required_skills && (
                        <div className="skill-tags">
                          {(Array.isArray(
                            job.required_skills
                          )
                            ? job.required_skills
                            : []
                          ).map((skill) => (
                            <span key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="job-actions">
                      {job.status === "approved" &&
                        job.source ===
                          "available" && (
                          <button
                            className="primary-button"
                            onClick={() =>
                              workerAction(
                                job.id,
                                "accept"
                              )
                            }
                            disabled={loading}
                          >
                            Accept Job
                          </button>
                        )}

                      {job.status === "accepted" && (
                        <button
                          className="primary-button"
                          onClick={() => {
                            const message =
                              window.prompt(
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
                          Submit Completion
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="earnings-section">
            <div className="section-heading compact">
              <span className="eyebrow">
                EARNINGS
              </span>
              <h2>Request a payout</h2>
            </div>

            <div className="payout-layout">
              <form
                className="form-card"
                onSubmit={submitPayout}
              >
                <label>
                  Amount
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
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
                    placeholder="Bank transfer, mobile money, etc."
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
                    rows="4"
                    placeholder="Enter the details needed to process your payout."
                    value={
                      payoutForm.accountDetails
                    }
                    onChange={(e) =>
                      setPayoutForm({
                        ...payoutForm,
                        accountDetails:
                          e.target.value,
                      })
                    }
                    required
                  />
                </label>

                <button
                  className="primary-button"
                  disabled={loading}
                >
                  Request Payout
                </button>
              </form>

              <div className="earnings-list">
                <h3>Earning history</h3>

                {earnings.length === 0 ? (
                  <p className="muted">
                    No earnings recorded yet.
                  </p>
                ) : (
                  earnings.map((earning) => (
                    <div
                      className="earning-row"
                      key={earning.id}
                    >
                      <div>
                        <strong>
                          {earning.description}
                        </strong>
                        <small>
                          {earning.created_at}
                        </small>
                      </div>

                      <strong>
                        {Number(
                          earning.amount
                        ).toLocaleString()}
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
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

export default Workspace;
