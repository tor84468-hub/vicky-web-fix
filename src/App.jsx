import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const WHATSAPP = "2290191649798";

function whatsapp(message) {
  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

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
  const [worker, setWorker] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("vicky_worker_token") || ""
  );

  const [loadingWorker, setLoadingWorker] = useState(true);

  useEffect(() => {
    async function loadWorker() {
      if (!token) {
        setLoadingWorker(false);
        return;
      }

      try {
        const data = await apiRequest("/workers/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setWorker(data.worker);
      } catch {
        localStorage.removeItem("vicky_worker_token");
        localStorage.removeItem("vicky_worker");
        setToken("");
        setWorker(null);
      } finally {
        setLoadingWorker(false);
      }
    }

    loadWorker();
  }, [token]);

  function saveWorkerSession(data) {
    localStorage.setItem("vicky_worker_token", data.token);
    localStorage.setItem(
      "vicky_worker",
      JSON.stringify(data.worker)
    );

    setToken(data.token);
    setWorker(data.worker);
    setPage("dashboard");
  }

  function logout() {
    localStorage.removeItem("vicky_worker_token");
    localStorage.removeItem("vicky_worker");

    setToken("");
    setWorker(null);
    setPage("home");
  }

  return (
    <>
      <header className="navbar">
        <div
          className="logo"
          onClick={() => setPage("home")}
          style={{ cursor: "pointer" }}
        >
          Vicky Web Fix
        </div>

        <nav>
          {worker ? (
            <>
              <button
                className="nav-link"
                onClick={() => setPage("dashboard")}
              >
                Dashboard
              </button>

              <button
                className="nav-link"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-link"
                onClick={() => setPage("login")}
              >
                Worker Login
              </button>

              <button
                className="nav-link"
                onClick={() => setPage("register")}
              >
                Become a Worker
              </button>
            </>
          )}
        </nav>
      </header>

      {loadingWorker ? (
        <main className="page">
          <section className="hero">
            <div className="hero-copy">
              <p className="eyebrow">VICKY WEB FIX</p>
              <h1>Loading your worker account...</h1>
            </div>
          </section>
        </main>
      ) : page === "login" ? (
        <WorkerLogin
          onSuccess={saveWorkerSession}
          goRegister={() => setPage("register")}
          goHome={() => setPage("home")}
        />
      ) : page === "register" ? (
        <WorkerRegister
          onSuccess={saveWorkerSession}
          goLogin={() => setPage("login")}
          goHome={() => setPage("home")}
        />
      ) : page === "dashboard" && worker ? (
        <WorkerDashboard
          worker={worker}
          token={token}
          logout={logout}
          goHome={() => setPage("home")}
        />
      ) : (
        <Home
          worker={worker}
          setPage={setPage}
        />
      )}
    </>
  );
}

function Home({ worker, setPage }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WEBSITE REPAIR & SUPPORT</p>

          <h1>Your website should work for you.</h1>

          <p className="hero-text">
            We help identify website problems, repair broken
            pages, improve mobile experiences and support
            website projects from inspection to completion.
          </p>

          <div className="hero-actions">
            <button
              className="primary-btn"
              onClick={() =>
                whatsapp(
                  "Hello Vicky Web Fix, I would like a free website inspection."
                )
              }
            >
              Get a Free Check
            </button>

            <button
              className="secondary-btn"
              onClick={() =>
                setPage(worker ? "dashboard" : "register")
              }
            >
              {worker ? "Worker Dashboard" : "Become a Worker"}
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

          <p className="card-label">WEBSITE STATUS</p>
          <h3>Problem identified</h3>
          <p>
            Ready for inspection and professional repair.
          </p>
        </div>
      </section>

      <section className="section worker-banner">
        <div>
          <p className="eyebrow">FOR WORKERS</p>
          <h2>Have website skills?</h2>
          <p>
            Join the Vicky Web Fix worker network and get
            opportunities to work on website projects.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setPage("register")}
        >
          Join the Worker Network →
        </button>
      </section>

      <section className="section">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>Two sides. One platform.</h2>

        <div className="steps-grid">
          <div className="step-card">
            <strong>01</strong>
            <h3>Customer submits a problem</h3>
            <p>A website issue or project is submitted.</p>
          </div>

          <div className="step-card">
            <strong>02</strong>
            <h3>We inspect the project</h3>
            <p>The problem is reviewed before work begins.</p>
          </div>

          <div className="step-card">
            <strong>03</strong>
            <h3>Worker gets the opportunity</h3>
            <p>A suitable worker can be assigned the work.</p>
          </div>

          <div className="step-card">
            <strong>04</strong>
            <h3>Work gets completed</h3>
            <p>The website is repaired, tested and delivered.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">FOR DEVELOPERS & TECH WORKERS</p>
        <h2>Turn your website skills into opportunities.</h2>

        <div className="benefits-grid">
          <div>Find projects</div>
          <div>Work remotely</div>
          <div>Build experience</div>
          <div>Earn from completed work</div>
        </div>

        <button
          className="primary-btn"
          onClick={() => setPage("register")}
        >
          Create Worker Account
        </button>
      </section>

      <section className="section">
        <div className="final-cta">
          <p className="eyebrow">NEED HELP?</p>
          <h2>Let us inspect your website.</h2>

          <button
            className="primary-btn"
            onClick={() =>
              whatsapp(
                "Hello Vicky Web Fix, I need help with my website."
              )
            }
          >
            Contact Vicky Web Fix
          </button>
        </div>
      </section>

      <footer className="footer">
        <strong>Vicky Web Fix</strong>
        <p>
          Website repair, support and worker opportunities.
        </p>

        <button
          className="nav-link"
          onClick={() => setPage("register")}
        >
          Become a Worker →
        </button>
      </footer>
    </main>
  );
}

function WorkerLogin({ onSuccess, goRegister, goHome }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/workers/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="eyebrow">WORKER PORTAL</p>
        <h1>Worker Login</h1>

        <p>
          Sign in to access your Vicky Web Fix worker
          account.
        </p>

        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
            placeholder="Your password"
          />

          {error && <div className="form-error">{error}</div>}

          <button
            className="primary-btn full-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button className="text-btn" onClick={goRegister}>
          Don't have an account? Become a Worker
        </button>

        <button className="text-btn" onClick={goHome}>
          ← Back to Vicky Web Fix
        </button>
      </section>
    </main>
  );
}

function WorkerRegister({ onSuccess, goLogin, goHome }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    skills: [],
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleSkill(skill) {
    setForm((current) => {
      const exists = current.skills.includes(skill);

      return {
        ...current,
        skills: exists
          ? current.skills.filter((item) => item !== skill)
          : [...current.skills, skill],
      };
    });
  }

  async function submit(event) {
    event.preventDefault();

    setError("");

    if (form.skills.length === 0) {
      setError("Select at least one skill.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiRequest("/workers/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide-card">
        <p className="eyebrow">VICKY WEB FIX WORKER NETWORK</p>

        <h1>Become a Worker</h1>

        <p>
          Create your worker account and become eligible for
          website project opportunities.
        </p>

        <form onSubmit={submit}>
          <label>Full Name</label>
          <input
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            required
            placeholder="Your full name"
          />

          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            required
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            minLength="6"
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            required
            placeholder="At least 6 characters"
          />

          <label>Your Skills</label>

          <div className="skills-grid">
            {SKILLS.map((skill) => (
              <button
                type="button"
                key={skill}
                className={
                  form.skills.includes(skill)
                    ? "skill-btn selected"
                    : "skill-btn"
                }
                onClick={() => toggleSkill(skill)}
              >
                {form.skills.includes(skill) ? "✓ " : ""}
                {skill}
              </button>
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <button
            className="primary-btn full-btn"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Worker Account"}
          </button>
        </form>

        <button className="text-btn" onClick={goLogin}>
          Already have an account? Worker Login
        </button>

        <button className="text-btn" onClick={goHome}>
          ← Back to Vicky Web Fix
        </button>
      </section>
    </main>
  );
}

function WorkerDashboard({
  worker,
  token,
  logout,
  goHome,
}) {
  const [freshWorker, setFreshWorker] = useState(worker);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function refresh() {
      try {
        const data = await apiRequest("/workers/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFreshWorker(data.worker);

        localStorage.setItem(
          "vicky_worker",
          JSON.stringify(data.worker)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    refresh();
  }, [token]);

  const currentWorker = freshWorker || worker;

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="eyebrow">WORKER DASHBOARD</p>
          <h1>Welcome, {currentWorker.name}</h1>
          <p>
            Worker ID:{" "}
            <strong>{currentWorker.workerId}</strong>
          </p>
        </div>

        <div className="dashboard-actions">
          <button className="secondary-btn" onClick={goHome}>
            View Website
          </button>

          <button className="primary-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </section>

      {loading && (
        <div className="dashboard-message">
          Refreshing your account...
        </div>
      )}

      {error && (
        <div className="form-error dashboard-message">
          {error}
        </div>
      )}

      <section className="stats-grid">
        <div className="stat-card">
          <span>ACCOUNT STATUS</span>
          <strong>{currentWorker.status}</strong>
        </div>

        <div className="stat-card">
          <span>AVAILABLE JOBS</span>
          <strong>0</strong>
        </div>

        <div className="stat-card">
          <span>ACTIVE JOBS</span>
          <strong>0</strong>
        </div>

        <div className="stat-card">
          <span>COMPLETED JOBS</span>
          <strong>{currentWorker.completedJobs}</strong>
        </div>

        <div className="stat-card">
          <span>TOTAL EARNINGS</span>
          <strong>{currentWorker.totalEarnings}</strong>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <p className="eyebrow">YOUR PROFILE</p>

          <h2>{currentWorker.name}</h2>

          <p>{currentWorker.email}</p>

          <div className="profile-status">
            Status: <strong>{currentWorker.status}</strong>
          </div>
        </div>

        <div className="dashboard-card">
          <p className="eyebrow">YOUR SKILLS</p>

          <div className="skill-list">
            {currentWorker.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-card jobs-empty">
        <p className="eyebrow">JOB OPPORTUNITIES</p>
        <h2>No jobs assigned yet.</h2>
        <p>
          Your worker account is connected to the Vicky Web
          Fix backend. Job assignment and worker payouts will
          be added in the next marketplace build.
        </p>
      </section>
    </main>
  );
}

export default App;
