require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const db = require("./database");

const app = express();

const PORT = process.env.PORT || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "CHANGE_THIS_SECRET_BEFORE_PRODUCTION";

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

function id(prefix) {
  return `${prefix}-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}

function tokenFor(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
  };
}

async function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required.",
    });
  }

  try {
    req.user = jwt.verify(
      header.slice(7),
      JWT_SECRET
    );

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token.",
    });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "You do not have permission for this action.",
      });
    }

    next();
  };
}

async function getWorker(userId) {
  const result = await db.query(
    `
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.status,
      u.created_at,
      wp.worker_id,
      wp.skills,
      wp.completed_jobs,
      wp.total_earnings,
      wp.available,
      wp.approved_at
    FROM users u
    JOIN worker_profiles wp ON wp.user_id = u.id
    WHERE u.id = $1
    `,
    [userId]
  );

  return result.rows[0];
}

async function addJobEvent(
  jobId,
  actorId,
  event,
  note = null
) {
  await db.query(
    `
    INSERT INTO job_events
      (job_id, actor_id, event, note)
    VALUES ($1, $2, $3, $4)
    `,
    [jobId, actorId || null, event, note]
  );
}

/* HEALTH */

app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      success: true,
      service: "Vicky Web Fix backend",
      status: "running",
      database: "connected",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: "Vicky Web Fix backend",
      status: "running",
      database: "unavailable",
    });
  }
});

/* CUSTOMER REGISTRATION */

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rowCount) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const result = await db.query(
      `
      INSERT INTO users
        (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, 'customer', 'active')
      RETURNING id, name, email, role, status
      `,
      [
        name.trim(),
        normalizedEmail,
        passwordHash,
      ]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      token: tokenFor(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Customer registration:", error);

    res.status(500).json({
      error: "Unable to create account.",
    });
  }
});

/* LOGIN */

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const result = await db.query(
      `
      SELECT id, name, email, password_hash, role, status
      FROM users
      WHERE email = $1
      `,
      [email.trim().toLowerCase()]
    );

    if (!result.rowCount) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        error: "This account has been suspended.",
      });
    }

    res.json({
      success: true,
      token: tokenFor(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login:", error);

    res.status(500).json({
      error: "Unable to log in.",
    });
  }
});

/* CURRENT USER */

app.get("/api/auth/me", auth, async (req, res) => {
  const result = await db.query(
    `
    SELECT id, name, email, role, status, created_at
    FROM users
    WHERE id = $1
    `,
    [req.user.userId]
  );

  if (!result.rowCount) {
    return res.status(404).json({
      error: "Account not found.",
    });
  }

  res.json({
    success: true,
    user: result.rows[0],
  });
});

/* WORKER REGISTRATION */

app.post("/api/workers/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      skills = [],
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must contain at least 6 characters.",
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        error: "Skills must be an array.",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (existing.rowCount) {
      return res.status(409).json({
        error: "An account with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      const userResult = await client.query(
        `
        INSERT INTO users
          (name, email, password_hash, role, status)
        VALUES ($1, $2, $3, 'worker', 'pending')
        RETURNING id, name, email, role, status
        `,
        [
          name.trim(),
          normalizedEmail,
          passwordHash,
        ]
      );

      const user = userResult.rows[0];

      const workerId = id("VWF");

      await client.query(
        `
        INSERT INTO worker_profiles
          (user_id, worker_id, skills)
        VALUES ($1, $2, $3)
        `,
        [
          user.id,
          workerId,
          JSON.stringify(skills),
        ]
      );

      await client.query("COMMIT");

      res.status(201).json({
        success: true,
        message:
          "Worker account created. Awaiting approval.",
        token: tokenFor(user),
        worker: {
          workerId,
          name: user.name,
          email: user.email,
          skills,
          status: "pending",
          totalEarnings: 0,
          completedJobs: 0,
          available: true,
        },
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Worker registration:", error);

    res.status(500).json({
      error: "Unable to create worker account.",
    });
  }
});

/* WORKER PROFILE */

app.get(
  "/api/workers/me",
  auth,
  requireRole("worker"),
  async (req, res) => {
    const worker = await getWorker(
      req.user.userId
    );

    if (!worker) {
      return res.status(404).json({
        error: "Worker account not found.",
      });
    }

    res.json({
      success: true,
      worker: {
        workerId: worker.worker_id,
        name: worker.name,
        email: worker.email,
        skills: worker.skills,
        status: worker.status,
        totalEarnings:
          Number(worker.total_earnings),
        completedJobs: worker.completed_jobs,
        available: worker.available,
        approvedAt: worker.approved_at,
        createdAt: worker.created_at,
      },
    });
  }
);

/* JOB CREATION */

app.post(
  "/api/jobs",
  auth,
  requireRole("customer", "admin"),
  async (req, res) => {
    try {
      const {
        title,
        websiteUrl = "",
        description,
        requiredSkills = [],
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          error: "Title and description are required.",
        });
      }

      if (!Array.isArray(requiredSkills)) {
        return res.status(400).json({
          error: "Required skills must be an array.",
        });
      }

      const jobId = id("JOB");

      const result = await db.query(
        `
        INSERT INTO jobs
          (
            job_id,
            customer_id,
            title,
            website_url,
            description,
            required_skills,
            status
          )
        VALUES
          ($1, $2, $3, $4, $5, $6, 'pending')
        RETURNING *
        `,
        [
          jobId,
          req.user.userId,
          title.trim(),
          websiteUrl.trim(),
          description.trim(),
          JSON.stringify(requiredSkills),
        ]
      );

      await addJobEvent(
        result.rows[0].id,
        req.user.userId,
        "job_created"
      );

      res.status(201).json({
        success: true,
        job: result.rows[0],
      });
    } catch (error) {
      console.error("Job creation:", error);

      res.status(500).json({
        error: "Unable to create job.",
      });
    }
  }
);

/* CUSTOMER JOBS */

app.get(
  "/api/jobs/my",
  auth,
  requireRole("customer"),
  async (req, res) => {
    const result = await db.query(
      `
      SELECT *
      FROM jobs
      WHERE customer_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.userId]
    );

    res.json({
      success: true,
      jobs: result.rows,
    });
  }
);

/* WORKER AVAILABLE JOBS */

app.get(
  "/api/jobs/available",
  auth,
  requireRole("worker"),
  async (req, res) => {
    const worker = await getWorker(
      req.user.userId
    );

    if (!worker) {
      return res.status(404).json({
        error: "Worker profile not found.",
      });
    }

    if (worker.status !== "approved") {
      return res.json({
        success: true,
        jobs: [],
        message:
          "Your worker account is awaiting approval.",
      });
    }

    const result = await db.query(
      `
      SELECT
        id,
        job_id,
        title,
        website_url,
        description,
        required_skills,
        status,
        created_at
      FROM jobs
      WHERE status = 'approved'
        AND assigned_worker_id IS NULL
      ORDER BY created_at ASC
      `
    );

    res.json({
      success: true,
      jobs: result.rows,
    });
  }
);

/* WORKER ACTIVE JOBS */

app.get(
  "/api/jobs/worker",
  auth,
  requireRole("worker"),
  async (req, res) => {
    const result = await db.query(
      `
      SELECT *
      FROM jobs
      WHERE assigned_worker_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.userId]
    );

    res.json({
      success: true,
      jobs: result.rows,
    });
  }
);

/* ADMIN JOBS */

app.get(
  "/api/admin/jobs",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const result = await db.query(
      `
      SELECT
        j.*,
        c.name AS customer_name,
        c.email AS customer_email,
        w.name AS worker_name,
        w.email AS worker_email
      FROM jobs j
      LEFT JOIN users c ON c.id = j.customer_id
      LEFT JOIN users w ON w.id = j.assigned_worker_id
      ORDER BY j.created_at DESC
      `
    );

    res.json({
      success: true,
      jobs: result.rows,
    });
  }
);

/* ADMIN WORKERS */

app.get(
  "/api/admin/workers",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const result = await db.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.status,
        u.created_at,
        wp.worker_id,
        wp.skills,
        wp.completed_jobs,
        wp.total_earnings,
        wp.available
      FROM users u
      JOIN worker_profiles wp
        ON wp.user_id = u.id
      ORDER BY u.created_at DESC
      `
    );

    res.json({
      success: true,
      workers: result.rows,
    });
  }
);

/* ADMIN APPROVE WORKER */

app.patch(
  "/api/admin/workers/:workerId/approve",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const result = await db.query(
      `
      UPDATE users
      SET status = 'approved'
      WHERE id = $1
        AND role = 'worker'
      RETURNING id, name, email, status
      `,
      [req.params.workerId]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Worker not found.",
      });
    }

    await db.query(
      `
      UPDATE worker_profiles
      SET approved_at = NOW()
      WHERE user_id = $1
      `,
      [req.params.workerId]
    );

    res.json({
      success: true,
      worker: result.rows[0],
    });
  }
);

/* ADMIN SUSPEND WORKER */

app.patch(
  "/api/admin/workers/:workerId/suspend",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const result = await db.query(
      `
      UPDATE users
      SET status = 'suspended'
      WHERE id = $1
        AND role = 'worker'
      RETURNING id, name, email, status
      `,
      [req.params.workerId]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Worker not found.",
      });
    }

    res.json({
      success: true,
      worker: result.rows[0],
    });
  }
);

/* ADMIN APPROVE JOB */

app.patch(
  "/api/admin/jobs/:jobId/approve",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const result = await db.query(
      `
      UPDATE jobs
      SET
        status = 'approved',
        updated_at = NOW()
      WHERE id = $1
        AND status = 'pending'
      RETURNING *
      `,
      [req.params.jobId]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Pending job not found.",
      });
    }

    await addJobEvent(
      result.rows[0].id,
      req.user.userId,
      "job_approved"
    );

    res.json({
      success: true,
      job: result.rows[0],
    });
  }
);

/* WORKER ACCEPT JOB */

app.patch(
  "/api/jobs/:jobId/accept",
  auth,
  requireRole("worker"),
  async (req, res) => {
    const worker = await getWorker(
      req.user.userId
    );

    if (!worker || worker.status !== "approved") {
      return res.status(403).json({
        error: "Your worker account is not approved.",
      });
    }

    const result = await db.query(
      `
      UPDATE jobs
      SET
        assigned_worker_id = $1,
        status = 'accepted',
        updated_at = NOW()
      WHERE id = $2
        AND status = 'approved'
        AND assigned_worker_id IS NULL
      RETURNING *
      `,
      [
        req.user.userId,
        req.params.jobId,
      ]
    );

    if (!result.rowCount) {
      return res.status(409).json({
        error:
          "This job is no longer available.",
      });
    }

    await addJobEvent(
      result.rows[0].id,
      req.user.userId,
      "job_accepted"
    );

    res.json({
      success: true,
      job: result.rows[0],
    });
  }
);

/* WORKER SUBMIT COMPLETION */

app.patch(
  "/api/jobs/:jobId/complete",
  auth,
  requireRole("worker"),
  async (req, res) => {
    const {
      message = "",
    } = req.body;

    const result = await db.query(
      `
      UPDATE jobs
      SET
        status = 'completed_pending_approval',
        completion_message = $1,
        completed_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
        AND assigned_worker_id = $3
        AND status = 'accepted'
      RETURNING *
      `,
      [
        message.trim(),
        req.params.jobId,
        req.user.userId,
      ]
    );

    if (!result.rowCount) {
      return res.status(409).json({
        error:
          "This job cannot be marked completed.",
      });
    }

    await addJobEvent(
      result.rows[0].id,
      req.user.userId,
      "completion_submitted",
      message.trim()
    );

    res.json({
      success: true,
      job: result.rows[0],
    });
  }
);

/* CUSTOMER APPROVE COMPLETION */

app.patch(
  "/api/jobs/:jobId/approve-completion",
  auth,
  requireRole("customer"),
  async (req, res) => {
    const client = await db.pool.connect();

    try {
      await client.query("BEGIN");

      const jobResult = await client.query(
        `
        SELECT *
        FROM jobs
        WHERE id = $1
          AND customer_id = $2
          AND status = 'completed_pending_approval'
        FOR UPDATE
        `,
        [
          req.params.jobId,
          req.user.userId,
        ]
      );

      if (!jobResult.rowCount) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          error:
            "This completion cannot be approved.",
        });
      }

      const job = jobResult.rows[0];

      const amount =
        Number(process.env.DEFAULT_JOB_EARNING || 0);

      await client.query(
        `
        UPDATE jobs
        SET
          status = 'completed',
          approved_at = NOW(),
          updated_at = NOW()
        WHERE id = $1
        `,
        [job.id]
      );

      if (job.assigned_worker_id && amount > 0) {
        await client.query(
          `
          INSERT INTO earnings
            (
              worker_id,
              job_id,
              amount,
              type,
              description
            )
          VALUES
            ($1, $2, $3, 'job', $4)
          `,
          [
            job.assigned_worker_id,
            job.id,
            amount,
            `Earnings for ${job.job_id}`,
          ]
        );

        await client.query(
          `
          UPDATE worker_profiles
          SET
            total_earnings =
              total_earnings + $1,
            completed_jobs =
              completed_jobs + 1
          WHERE user_id = $2
          `,
          [
            amount,
            job.assigned_worker_id,
          ]
        );
      }

      await client.query(
        `
        INSERT INTO job_events
          (job_id, actor_id, event, note)
        VALUES ($1, $2, 'completion_approved', $3)
        `,
        [
          job.id,
          req.user.userId,
          amount > 0
            ? `Worker credited ${amount}`
            : "Completion approved",
        ]
      );

      await client.query("COMMIT");

      res.json({
        success: true,
        message:
          "Job completion approved.",
        earningCreated: amount > 0,
        amount,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      console.error(
        "Completion approval:",
        error
      );

      res.status(500).json({
        error:
          "Unable to approve completion.",
      });
    } finally {
      client.release();
    }
  }
);

/* WORKER EARNINGS */

app.get(
  "/api/earnings",
  auth,
  requireRole("worker"),
  async (req, res) => {
    const earnings = await db.query(
      `
      SELECT *
      FROM earnings
      WHERE worker_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.userId]
    );

    const worker = await getWorker(
      req.user.userId
    );

    res.json({
      success: true,
      balance: Number(
        worker?.total_earnings || 0
      ),
      earnings: earnings.rows,
    });
  }
);

/* PAYOUT REQUEST */

app.post(
  "/api/payouts",
  auth,
  requireRole("worker"),
  async (req, res) => {
    try {
      const {
        amount,
        method,
        accountDetails,
      } = req.body;

      const requestedAmount =
        Number(amount);

      if (
        !Number.isFinite(requestedAmount) ||
        requestedAmount <= 0
      ) {
        return res.status(400).json({
          error: "Enter a valid payout amount.",
        });
      }

      if (!method || !accountDetails) {
        return res.status(400).json({
          error:
            "Payout method and account details are required.",
        });
      }

      const worker = await getWorker(
        req.user.userId
      );

      const balance = Number(
        worker?.total_earnings || 0
      );

      if (requestedAmount > balance) {
        return res.status(400).json({
          error: "Insufficient earnings balance.",
        });
      }

      const client = await db.pool.connect();

      try {
        await client.query("BEGIN");

        const lockedWorker = await client.query(
          `
          SELECT total_earnings
          FROM worker_profiles
          WHERE user_id = $1
          FOR UPDATE
          `,
          [req.user.userId]
        );

        if (!lockedWorker.rowCount) {
          await client.query("ROLLBACK");
          return res.status(404).json({
            error: "Worker profile not found.",
          });
        }

        const lockedBalance = Number(
          lockedWorker.rows[0].total_earnings || 0
        );

        const pendingResult = await client.query(
          `
          SELECT COALESCE(SUM(amount), 0) AS pending
          FROM payout_requests
          WHERE worker_id = $1
            AND status IN ('pending', 'processing')
          `,
          [req.user.userId]
        );

        const pendingAmount = Number(
          pendingResult.rows[0].pending || 0
        );

        const availableBalance =
          lockedBalance - pendingAmount;

        if (requestedAmount > availableBalance) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            error:
              "Requested amount exceeds your available payout balance.",
          });
        }

        const payoutId = id("PAY");

        const result = await client.query(
          `
          INSERT INTO payout_requests
            (
              payout_id,
              worker_id,
              amount,
              method,
              account_details
            )
          VALUES
            ($1, $2, $3, $4, $5)
          RETURNING *
          `,
          [
            payoutId,
            req.user.userId,
            requestedAmount,
            method.trim(),
            accountDetails.trim(),
          ]
        );

        await client.query("COMMIT");

        return res.status(201).json({
          success: true,
          payout: result.rows[0],
        });
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      res.status(201).json({
        success: true,
        payout: result.rows[0],
      });
    } catch (error) {
      console.error("Payout request:", error);

      res.status(500).json({
        error:
          "Unable to create payout request.",
      });
    }
  }
);

/* ADMIN PAYOUTS */

app.get(
  "/api/admin/payouts",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const result = await db.query(
      `
      SELECT
        p.*,
        u.name AS worker_name,
        u.email AS worker_email
      FROM payout_requests p
      JOIN users u ON u.id = p.worker_id
      ORDER BY p.created_at DESC
      `
    );

    res.json({
      success: true,
      payouts: result.rows,
    });
  }
);

/* ADMIN UPDATE PAYOUT */

app.patch(
  "/api/admin/payouts/:payoutId",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const {
      status,
      adminNote = "",
    } = req.body;

    const allowed = [
      "processing",
      "paid",
      "rejected",
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        error: "Invalid payout status.",
      });
    }

    const result = await db.query(
      `
      UPDATE payout_requests
      SET
        status = $1,
        admin_note = $2,
        processed_at =
          CASE
            WHEN $1 IN ('paid','rejected')
            THEN NOW()
            ELSE processed_at
          END
      WHERE id = $3
      RETURNING *
      `,
      [
        status,
        adminNote.trim(),
        req.params.payoutId,
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        error: "Payout request not found.",
      });
    }

    res.json({
      success: true,
      payout: result.rows[0],
    });
  }
);

/* ADMIN DASHBOARD */

app.get(
  "/api/admin/stats",
  auth,
  requireRole("admin"),
  async (req, res) => {
    const [
      users,
      workers,
      pendingWorkers,
      jobs,
      activeJobs,
      completedJobs,
      payouts,
    ] = await Promise.all([
      db.query(
        "SELECT COUNT(*)::int AS count FROM users WHERE role = 'customer'"
      ),
      db.query(
        "SELECT COUNT(*)::int AS count FROM users WHERE role = 'worker'"
      ),
      db.query(
        "SELECT COUNT(*)::int AS count FROM users WHERE role = 'worker' AND status = 'pending'"
      ),
      db.query(
        "SELECT COUNT(*)::int AS count FROM jobs"
      ),
      db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM jobs
        WHERE status IN ('accepted','completed_pending_approval')
        `
      ),
      db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM jobs
        WHERE status = 'completed'
        `
      ),
      db.query(
        `
        SELECT COUNT(*)::int AS count
        FROM payout_requests
        WHERE status = 'pending'
        `
      ),
    ]);

    res.json({
      success: true,
      stats: {
        customers: users.rows[0].count,
        workers: workers.rows[0].count,
        pendingWorkers:
          pendingWorkers.rows[0].count,
        jobs: jobs.rows[0].count,
        activeJobs:
          activeJobs.rows[0].count,
        completedJobs:
          completedJobs.rows[0].count,
        pendingPayouts:
          payouts.rows[0].count,
      },
    });
  }
);

/* START */

async function start() {
  try {
    await db.initDatabase();

    console.log(
      "Vicky Web Fix PostgreSQL database ready"
    );

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Vicky Web Fix backend running on port ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "Database startup failed:",
      error
    );

    process.exit(1);
  }
}

start();
