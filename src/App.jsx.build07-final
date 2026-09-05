import { useState } from "react";
import "./App.css";

const WHATSAPP = "2290191649798";

function whatsapp(message) {
  window.open(
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
}

function App() {
  const [form, setForm] = useState({
    name: "",
    business: "",
    website: "",
    problem: "",
  });

  const [sent, setSent] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function submitCheck(e) {
    e.preventDefault();

    const message = `Hello Vicky Web Fix,

I would like a free website inspection.

Name: ${form.name}
Business/Project: ${form.business}
Website: ${form.website}
Problem: ${form.problem}

Please let me know what needs to be fixed.`;

    whatsapp(message);
    setSent(true);
  }

  function serviceMessage(service) {
    whatsapp(
      `Hello Vicky Web Fix,

I am interested in your ${service} service.

Please let me know what information you need from me.`
    );
  }

  return (
    <div className="app">

      <nav className="navbar">
        <a href="#" className="logo">
          <span>V</span>
          Vicky Web Fix
        </a>

        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#work">Our Work</a>
          <a href="#faq">FAQ</a>
        </div>

        <a href="#check" className="nav-btn">
          Get a Free Check
        </a>
      </nav>

      <main>

        <section className="hero">
          <div className="hero-content">

            <div className="badge">
              WEBSITE REPAIR & SUPPORT
            </div>

            <h1>
              Your website should
              <strong>work for you.</strong>
            </h1>

            <p>
              We fix broken websites, mobile problems, forms, buttons,
              pages and deployment issues for businesses, creators and
              individuals.
            </p>

            <div className="hero-actions">
              <a href="#check" className="primary-btn">
                Get a Free Website Check →
              </a>

              <a href="#services" className="secondary-btn">
                See What We Fix
              </a>
            </div>

            <div className="trust">
              <span>✓ Free initial inspection</span>
              <span>✓ Clear communication</span>
              <span>✓ WhatsApp support</span>
            </div>

          </div>

          <div className="hero-card">

            <div className="window-top">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <div className="repair-card">

              <div className="repair-icon">
                ✓
              </div>

              <div className="small-label">
                WEBSITE STATUS
              </div>

              <h3>
                Problem identified
              </h3>

              <p>
                We'll find the issue and explain the next step.
              </p>

              <div className="status">
                <span></span>
                Ready for inspection
              </div>

            </div>
          </div>
        </section>

        <section className="stats">

          <div>
            <strong>01</strong>
            <span>Send your website</span>
          </div>

          <div>
            <strong>02</strong>
            <span>We inspect it</span>
          </div>

          <div>
            <strong>03</strong>
            <span>You approve the repair</span>
          </div>

          <div>
            <strong>04</strong>
            <span>We fix and test it</span>
          </div>

        </section>

        <section id="services" className="section">

          <div className="section-heading">

            <div className="badge">
              WHAT WE FIX
            </div>

            <h2>
              Website problems shouldn't keep you from serving your customers.
            </h2>

            <p>
              Practical website repair, improvement and support without
              unnecessary technical complications.
            </p>

          </div>

          <div className="services">

            <div className="service">

              <div className="service-top">
                <div className="service-number">01</div>
                <span>REPAIR</span>
              </div>

              <h3>
                Bug Fixes
              </h3>

              <p>
                Fix broken buttons, links, pages, menus, scripts and
                other website functionality problems.
              </p>

              <div className="service-list">
                <span>✓ Broken buttons</span>
                <span>✓ Broken links</span>
                <span>✓ Page errors</span>
              </div>


              <button
                onClick={() => serviceMessage("Bug Fixes")}
              >
                Request This Service →
              </button>

            </div>

            <div className="service">

              <div className="service-top">
                <div className="service-number">02</div>
                <span>MOBILE</span>
              </div>

              <h3>
                Mobile Fixes
              </h3>

              <p>
                Fix websites that overflow, break or become difficult
                to use on phones and tablets.
              </p>

              <div className="service-list">
                <span>✓ Responsive layout</span>
                <span>✓ Overflow problems</span>
                <span>✓ Mobile testing</span>
              </div>


              <button
                onClick={() => serviceMessage("Mobile Fixes")}
              >
                Request This Service →
              </button>

            </div>

            <div className="service">

              <div className="service-top">
                <div className="service-number">03</div>
                <span>DESIGN</span>
              </div>

              <h3>
                Landing Pages
              </h3>

              <p>
                Create or improve a professional page for a business,
                product, service or campaign.
              </p>

              <div className="service-list">
                <span>✓ Professional layout</span>
                <span>✓ Call-to-action</span>
                <span>✓ Mobile responsive</span>
              </div>


              <button
                onClick={() => serviceMessage("Landing Pages")}
              >
                Request This Service →
              </button>

            </div>

            <div className="service">

              <div className="service-top">
                <div className="service-number">04</div>
                <span>ONLINE</span>
              </div>

              <h3>
                Deployment
              </h3>

              <p>
                Put your completed website online and help configure
                the required deployment settings.
              </p>

              <div className="service-list">
                <span>✓ Hosting setup</span>
                <span>✓ Deployment</span>
                <span>✓ Basic configuration</span>
              </div>


              <button
                onClick={() => serviceMessage("Deployment")}
              >
                Request This Service →
              </button>

            </div>

          </div>

        </section>

        <section className="conversion">

          <div>
            <div className="badge">
              NOT SURE WHAT YOU NEED?
            </div>

            <h2>
              Send us the website. We'll help identify the problem.
            </h2>

            <p>
              You don't need to know the technical name of the problem.
              Just tell us what is happening.
            </p>
          </div>

          <a href="#check" className="primary-btn">
            Send My Website →
          </a>

        </section>

        <section className="why">

          <div className="why-copy">

            <div className="badge">
              WHY VICKY WEB FIX
            </div>

            <h2>
              Simple, practical and transparent.
            </h2>

            <p>
              We focus on solving the actual problem instead of making
              things unnecessarily complicated.
            </p>

            <a href="#check" className="primary-btn">
              Check My Website →
            </a>

          </div>

          <div className="why-list">

            <div>
              <span>01</span>
              <div>
                <h3>
                  Inspect first
                </h3>
                <p>
                  We identify the problem before recommending any repair.
                </p>
              </div>
            </div>

            <div>
              <span>02</span>
              <div>
                <h3>
                  Understand the solution
                </h3>
                <p>
                  You receive a clear explanation of the work before anything begins.
                </p>
              </div>
            </div>

            <div>
              <span>03</span>
              <div>
                <h3>
                  Approve first
                </h3>
                <p>
                  No repair starts until you agree to proceed.
                </p>
              </div>
            </div>

            <div>
              <span>04</span>
              <div>
                <h3>
                  Test before delivery
                </h3>
                <p>
                  We test the repaired area before considering the job complete.
                </p>
              </div>
            </div>

          </div>
        </section>

        <section className="process">

          <div className="section-heading">

            <div className="badge">
              HOW IT WORKS
            </div>

            <h2>
              From problem to solution.
            </h2>

            <p>
              A straightforward process designed to keep things clear.
            </p>

          </div>

          <div className="steps">

            <div>
              <span>01</span>
              <h3>
                Send your website
              </h3>
              <p>
                Tell us the website address and what isn't working.
              </p>
            </div>

            <div>
              <span>02</span>
              <h3>
                Free inspection
              </h3>
              <p>
                We inspect the issue and explain the recommended solution.
              </p>
            </div>

            <div>
              <span>03</span>
              <h3>
                Approve the repair
              </h3>
              <p>
                You decide whether you want us to continue.
              </p>
            </div>

            <div>
              <span>04</span>
              <h3>
                Repair & test
              </h3>
              <p>
                We fix the issue, test the website and make sure the repaired area works properly.
              </p>
            </div>

          </div>

        </section>

        <section id="work" className="portfolio">

          <div className="section-heading">

            <div className="badge">
              DEMONSTRATION WORK
            </div>

            <h2>
              See the type of work we provide.
            </h2>

            <p>
              Demonstration projects created to show our design,
              repair and development capabilities.
            </p>

          </div>

          <div className="portfolio-grid">

            <div className="project">

              <div className="project-preview business-preview">
                <div className="mock-nav">
                  BUSINESS
                </div>

                <div className="mock-title">
                  Grow your business online.
                </div>

                <div className="mock-button">
                  Get Started
                </div>
              </div>

              <div className="project-info">
                <span>
                  DEMO 01
                </span>

                <h3>
                  Business Website
                </h3>

                <p>
                  A clean business website concept designed to present
                  services clearly.
                </p>
              </div>

            </div>

            <div className="project">

              <div className="project-preview portfolio-preview">
                <div className="mock-nav">
                  PORTFOLIO
                </div>

                <div className="mock-title">
                  Creative work. Professional results.
                </div>

                <div className="mock-button">
                  View Work
                </div>
              </div>

              <div className="project-info">
                <span>
                  DEMO 02
                </span>

                <h3>
                  Personal Portfolio
                </h3>

                <p>
                  A professional portfolio concept for presenting skills
                  and creative work.
                </p>
              </div>

            </div>

            <div className="project">

              <div className="project-preview repair-preview">

                <div className="error-box">
                  404
                </div>

                <div className="repair-arrow">
                  →
                </div>

                <div className="success-box">
                  ✓ FIXED
                </div>

              </div>

              <div className="project-info">
                <span>
                  DEMO 03
                </span>

                <h3>
                  Website Repair
                </h3>

                <p>
                  A visual demonstration of turning a broken website
                  experience into a working one.
                </p>
              </div>

            </div>

          </div>

        </section>

        <section className="about">

          <div className="about-card">

            <div className="about-mark">
              V
            </div>

            <div>

              <div className="badge">
                ABOUT VICKY WEB FIX
              </div>

              <h2>
                Built to solve real website problems.
              </h2>

              <p>
                Vicky Web Fix is a website repair and support service
                focused on helping businesses, creators and individuals
                deal with practical website problems.
              </p>

              <p>
                From a broken button to a website that looks terrible on
                mobile, the goal is simple: understand the problem,
                explain the solution and get the website working properly.
              </p>

              <a href="#check" className="secondary-btn">
                Start With a Free Check →
              </a>

            </div>

          </div>

        </section>

        <section id="check" className="check-section">

          <div className="check-copy">

            <div className="badge">
              FREE WEBSITE INSPECTION
            </div>

            <h2>
              Send us your website.
            </h2>

            <p>
              Tell us what is happening and we'll review the information
              before discussing the next step.
            </p>

            <div className="check-points">
              <span>✓ No obligation</span>
              <span>✓ Clear explanation</span>
              <span>✓ Clear agreement before work</span>
              <span>✓ WhatsApp support</span>
            </div>

            <div className="what-we-need">

              <h3>
                What we need
              </h3>

              <p>
                Your name, website address and a short explanation of
                the problem are enough to get started.
              </p>

            </div>

            <div className="direct-contact">

              <span>
                Prefer to message directly?
              </span>

              <button
                onClick={() =>
                  whatsapp(
                    "Hello Vicky Web Fix, I would like a free website inspection."
                  )
                }
              >
                Chat on WhatsApp →
              </button>

            </div>

          </div>

          <form
            className="check-form"
            onSubmit={submitCheck}
          >

            <label>
              Your name

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </label>

            <label>
              Business or project

              <input
                name="business"
                value={form.business}
                onChange={handleChange}
                placeholder="Business or project name"
                required
              />
            </label>

            <label>
              Website URL

              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
                required
              />
            </label>

            <label>
              What is wrong?

              <textarea
                name="problem"
                value={form.problem}
                onChange={handleChange}
                placeholder="Example: My website doesn't look good on mobile."
                rows="5"
                required
              />
            </label>

            <button
              type="submit"
              className="form-btn"
            >
              Request Free Inspection →
            </button>

            {sent && (
              <p className="form-success">
                WhatsApp opened. Complete the message to send your request.
              </p>
            )}

            <small className="privacy-note">
              Your information is used only to respond to your website enquiry.
            </small>

          </form>

        </section>

        <section id="faq" className="section faq">

          <div className="section-heading">

            <div className="badge">
              FAQ
            </div>

            <h2>
              Common questions.
            </h2>

          </div>

          <div className="faq-list">

            <details>
              <summary>
                Is the website inspection really free?
              </summary>

              <p>
                Yes. The initial inspection is free. We explain what
                we find before you decide whether to pay for a repair.
              </p>
            </details>

            <details>
              <summary>
                What happens after the inspection?
              </summary>

              <p>
                The next step depends on the type of problem, the amount of work
                required and the complexity of the website. We discuss the
                recommended solution with you after reviewing the problem.
              </p>
            </details>

            <details>
              <summary>
                Do I pay before you inspect my website?
              </summary>

              <p>
                No. The initial inspection is free. We explain the recommended work
                before anything begins.
              </p>
            </details>

            <details>
              <summary>
                Can you fix a website built by someone else?
              </summary>

              <p>
                Yes. We can inspect many different types of websites
                and determine what can be repaired or improved.
              </p>
            </details>

            <details>
              <summary>
                Do you build new websites?
              </summary>

              <p>
                Yes. We can create simple professional websites and
                landing pages for businesses, creators and individuals.
              </p>
            </details>

            <details>
              <summary>
                How do I start?
              </summary>

              <p>
                Send your website through the free inspection form or
                message Vicky Web Fix directly on WhatsApp.
              </p>
            </details>

          </div>

        </section>

        <section className="contact">

          <div>

            <div className="badge">
              READY TO FIX YOUR WEBSITE?
            </div>

            <h2>
              Let's get your website working properly.
            </h2>

            <p>
              Send the website address and tell us what is wrong.
            </p>

          </div>

          <a href="#check" className="primary-btn">
            Send My Website →
          </a>

        </section>

      </main>

      <button
        className="floating-whatsapp"
        onClick={() =>
          whatsapp(
            "Hello Vicky Web Fix, I need help fixing my website."
          )
        }
        aria-label="Chat with Vicky Web Fix on WhatsApp"
      >
        <span>◉</span>
        <b>WhatsApp</b>
      </button>

      <footer>

        <div>
          <strong>
            Vicky Web Fix
          </strong>

          <span>
            Website Repair & Support
          </span>
        </div>

        <div>
          Website repair • Mobile fixes • Landing pages • Deployment
        </div>

        <div>
          © 2026 Vicky Web Fix. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

export default App;
