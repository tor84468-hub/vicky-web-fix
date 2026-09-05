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
  process.env.JWT_SECRET || "vicky-web-fix-development-secret";

app.use(cors());
app.use(express.json());

function generateWorkerId() {
  return `VWF-${crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()}`;
}

function createToken(worker) {
  return jwt.sign(
    {
      workerId: worker.worker_id,
      email: worker.email
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicWorker(worker) {
  return {
    workerId: worker.worker_id,
    name: worker.name,
    email: worker.email,
    skills: worker.skills,
    status: worker.status,
    totalEarnings: worker.total_earnings,
    completedJobs: worker.completed_jobs,
    createdAt: worker.created_at
  };
}

function authenticateWorker(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required."
    });
  }

  try {
    req.worker = jwt.verify(
      header.slice(7),
      JWT_SECRET
    );

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired token."
    });
  }
}

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    service: "Vicky Web Fix backend",
    status: "running"
  });
});

app.post("/api/workers/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      skills = []
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must contain at least 6 characters."
      });
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        error: "Skills must be an array."
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (db.findWorkerByEmail(normalizedEmail)) {
      return res.status(409).json({
        error:
          "A worker account with this email already exists."
      });
    }

    const worker = {
      worker_id: generateWorkerId(),
      name: name.trim(),
      email: normalizedEmail,
      password_hash: await bcrypt.hash(
        password,
        12
      ),
      skills,
      status: "pending",
      total_earnings: 0,
      completed_jobs: 0,
      created_at: new Date().toISOString()
    };

    db.addWorker(worker);

    const token = createToken(worker);

    res.status(201).json({
      success: true,
      message:
        "Worker account created successfully.",
      token,
      worker: publicWorker(worker)
    });
  } catch (error) {
    console.error(
      "Worker registration error:",
      error
    );

    res.status(500).json({
      error: "Unable to create worker account."
    });
  }
});

app.post("/api/workers/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required."
      });
    }

    const worker = db.findWorkerByEmail(
      email.trim().toLowerCase()
    );

    if (!worker) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        worker.password_hash
      );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password."
      });
    }

    const token = createToken(worker);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      worker: publicWorker(worker)
    });
  } catch (error) {
    console.error(
      "Worker login error:",
      error
    );

    res.status(500).json({
      error: "Unable to log in."
    });
  }
});

app.get(
  "/api/workers/me",
  authenticateWorker,
  (req, res) => {
    const worker = db.findWorkerById(
      req.worker.workerId
    );

    if (!worker) {
      return res.status(404).json({
        error: "Worker account not found."
      });
    }

    res.json({
      success: true,
      worker: publicWorker(worker)
    });
  }
);

app.get("/api/workers/count", (req, res) => {
  res.json({
    success: true,
    count: db.countWorkers()
  });
});

app.listen(PORT, () => {
  console.log(
    `Vicky Web Fix backend running on port ${PORT}`
  );
});
