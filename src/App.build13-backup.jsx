import { useState } from "react";
import "./App.css";

const WHATSAPP = "2290191649798";

function whatsapp(message) {
  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

const initialWorker = {
  name: "",
  email: "",
  password: "",
  skills: [],
};

const skillOptions = [
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

function App() {
  const [page, setPage] = useState("home");
  const [worker, setWorker] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("vicky_worker")) || null;
    } catch {
      return null;
    }
  });

  const [form, setForm] = useState(initialWorker);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  function updateForm(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function toggleSkill(skill) {
    setForm((current) => ({
      ...current,
      skills: current.skills.includes(skill)
        ? current.skills.filter((item) => item !== skill)
        : [...current.skills, skill],
    }));
  }

  function registerWorker(e) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setMessage("Please complete all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      return;
    }

    const newWorker = {
      id: `WRK-${Date.now()}`,
      name: form.name,
      email: form.email.toLowerCase(),
      skills: form.skills,
      status: "Pending approval",
      joined: new Date().toLocaleDateString(),
      earnings: 0,
      completedJobs: 0,
    };

    localStorage.setItem("vicky_worker", JSON.stringify(newWorker));
    setWorker(newWorker);
    setForm(initialWorker);
    setMessage("");
    setPage("dashboard");
  }

  function loginWorker(e) {
    e.preventDefault();

    const saved = JSON.parse(localStorage.getItem("vicky_worker"));

    if (
      saved &&
      saved.email === login.email.toLowerCase() &&
      login.password
    ) {
      setWorker(saved);
      setLogin({ email: "", password: "" });
      setMessage("");
      setPage("dashboard");
      return;
    }

    setMessage(
      "Worker account not found on this device. Please register first."
    );
  }

  function logout() {
    setWorker(null);
    setPage("home");
  }

  if (page === "register") {
    return (
      <div className="worker-page">
        <div className="worker-card">
          <button className="back-button" onClick={() => setPage("home")}>
            ← Back
          </button>

          <div className="worker-brand">VICKY WEB FIX</div>

          <h1>Become a Worker</h1>
          <p className="worker-subtitle">
            Join the Vicky Web Fix worker network and get opportunities to work
            on website projects.
          </p>

          {message && <div className="form-message">{message}</div>}

          <form onSubmit={registerWorker}>
            <label>Full name</label>
            <input
              name="name"
              value={form.name}
              onChange={updateForm}
              placeholder="Your full name"
            />

            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateForm}
              placeholder="you@example.com"
            />

            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateForm}
              placeholder="At least 6 characters"
            />

            <label>Your skills</label>

            <div className="skill-grid">
              {skillOptions.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  className={
                    form.skills.includes(skill)
                      ? "skill-button active"
                      : "skill-button"
                  }
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>

            <button className="primary-button" type="submit">
              Create Worker Account
            </button>
          </form>

          <p className="worker-switch">
            Already a worker?{" "}
            <button onClick={() => setPage("login")}>Sign in</button>
          </p>
        </div>
      </div>
    );
  }

  if (page === "login") {
    return (
      <div className="worker-page">
        <div className="worker-card">
          <button className="back-button" onClick={() => setPage("home")}>
            ← Back
          </button>

          <div className="worker-brand">VICKY WEB FIX</div>

          <h1>Worker Login</h1>
          <p className="worker-subtitle">
            Sign in to access your worker dashboard.
          </p>

          {message && <div className="form-message">{message}</div>}

          <form onSubmit={loginWorker}>
            <label>Email address</label>
            <input
              type="email"
              value={login.email}
              onChange={(e) =>
                setLogin({ ...login, email: e.target.value })
              }
              placeholder="you@example.com"
            />

            <label>Password</label>
            <input
              type="password"
              value={login.password}
              onChange={(e) =>
                setLogin({ ...login, password: e.target.value })
              }
              placeholder="Your password"
            />

            <button className="primary-button" type="submit">
              Sign In
            </button>
          </form>

          <p className="worker-switch">
            New worker?{" "}
            <button onClick={() => setPage("register")}>Create account</button>
          </p>
        </div>
      </div>
    );
  }

  if (page === "dashboard" && worker) {
    return (
      <div className="worker-dashboard">
        <header className="worker-header">
          <div>
            <div className="worker-brand">VICKY WEB FIX</div>
            <span>Worker Portal</span>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </header>

        <main className="dashboard-content">
          <section className="dashboard-welcome">
            <div>
              <p className="eyebrow">WORKER DASHBOARD</p>
              <h1>Welcome, {worker.name}</h1>
              <p>
                Your worker account is ready. Job opportunities will appear
                here as the marketplace grows.
              </p>
            </div>

            <div className="worker-status">
              <span className="status-dot"></span>
              {worker.status}
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-card">
              <span>Available Jobs</span>
              <strong>0</strong>
              <small>New jobs waiting for workers</small>
            </div>

            <div className="dashboard-card">
              <span>Active Jobs</span>
              <strong>0</strong>
              <small>Jobs currently assigned to you</small>
            </div>

            <div className="dashboard-card">
              <span>Completed Jobs</span>
              <strong>{worker.completedJobs}</strong>
              <small>Your completed projects</small>
            </div>

            <div className="dashboard-card">
              <span>Total Earnings</span>
              <strong>0</strong>
              <small>Earnings will appear after paid jobs</small>
            </div>
          </section>

          <section className="dashboard-section">
            <div>
              <p className="eyebrow">YOUR PROFILE</p>
              <h2>Worker information</h2>
            </div>

            <div className="profile-box">
              <div>
                <span>Name</span>
                <strong>{worker.name}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{worker.email}</strong>
              </div>

              <div>
                <span>Worker ID</span>
                <strong>{worker.id}</strong>
              </div>

              <div>
                <span>Joined</span>
                <strong>{worker.joined}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-section">
            <p className="eyebrow">YOUR SKILLS</p>
            <h2>Skills & services</h2>

            <div className="profile-skills">
              {worker.skills.length > 0 ? (
                worker.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))
              ) : (
                <p>No skills selected yet.</p>
              )}
            </div>
          </section>

          <section className="worker-next">
            <div>
              <p className="eyebrow">NEXT STEP</p>
              <h2>Build your reputation</h2>
              <p>
                Complete jobs professionally, communicate clearly, and deliver
                before the deadline. Your completed work can help you receive
                more opportunities.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() =>
                whatsapp(
                  "Hello Vicky Web Fix, I am a registered worker and I would like to know about available work opportunities."
                )
              }
            >
              Contact Vicky Web Fix
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell">
      <nav className="navbar">
        <div className="brand">Vicky Web Fix</div>

        <div className="nav-actions">
          <button onClick={() => setPage("login")}>Worker Login</button>
          <button
            className="nav-cta"
            onClick={() => setPage("register")}
          >
            Become a Worker
          </button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <p className="eyebrow">WEBSITE REPAIR & SUPPORT</p>

            <h1>Your website should work for you.</h1>

            <p className="hero-text">
              We help businesses, creators and individuals repair website
              problems, improve mobile experiences and get their websites
              working properly.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() =>
                  whatsapp(
                    "Hello Vicky Web Fix, I would like a free website inspection."
                  )
                }
              >
                Get a Free Check
              </button>

              <button
                className="secondary-button"
                onClick={() => setPage("register")}
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

          <div className="repair-card">
            <div className="repair-icon">
              <span></span>
            </div>
            <p>WEBSITE STATUS</p>
            <h3>Problem identified</h3>
            <span>Ready for inspection</span>
          </div>
        </section>

        <section className="conversion">
          <div>
            <p className="eyebrow">FOR WORKERS</p>
            <h2>Have website skills?</h2>
            <p>
              Join our growing worker network. When customer projects become
              available, qualified workers can work on them and earn from
              completed jobs.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() => setPage("register")}
          >
            Join the Worker Network →
          </button>
        </section>

        <section className="section">
          <p className="eyebrow">HOW IT WORKS</p>
          <h2>Two sides. One platform.</h2>

          <div className="process-grid">
            <div>
              <span>01</span>
              <h3>Customer submits a problem</h3>
              <p>
                A customer tells us what is wrong with their website.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>We inspect the project</h3>
              <p>
                We understand the problem and determine what type of worker is
                needed.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>Worker gets the opportunity</h3>
              <p>
                A suitable worker can take on the project.
              </p>
            </div>

            <div>
              <span>04</span>
              <h3>Work gets completed</h3>
              <p>
                The customer receives the completed repair and the worker earns
                from the completed job.
              </p>
            </div>
          </div>
        </section>

        <section className="section worker-section">
          <p className="eyebrow">FOR DEVELOPERS & TECH WORKERS</p>
          <h2>Turn your website skills into opportunities.</h2>

          <div className="worker-benefits">
            <div>
              <strong>Find projects</strong>
              <p>Discover website work that matches your skills.</p>
            </div>

            <div>
              <strong>Work remotely</strong>
              <p>Complete suitable website projects from wherever you are.</p>
            </div>

            <div>
              <strong>Build experience</strong>
              <p>Grow your portfolio through real completed projects.</p>
            </div>

            <div>
              <strong>Earn from completed work</strong>
              <p>
                Get paid according to the platform's job and payout rules.
              </p>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() => setPage("register")}
          >
            Create Worker Account
          </button>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>Vicky Web Fix</strong>
          <p>Website repair, support and worker opportunities.</p>
        </div>

        <button onClick={() => setPage("register")}>
          Become a Worker →
        </button>
      </footer>
    </div>
  );
}

export default App;
