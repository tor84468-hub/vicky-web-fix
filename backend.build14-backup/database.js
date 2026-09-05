const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "vicky_web_fix.json");

const defaultDatabase = {
  workers: []
};

function loadDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(defaultDatabase, null, 2)
    );
  }

  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  } catch {
    return { ...defaultDatabase };
  }
}

function saveDatabase(data) {
  fs.writeFileSync(
    DB_FILE,
    JSON.stringify(data, null, 2)
  );
}

function getWorkers() {
  return loadDatabase().workers;
}

function findWorkerByEmail(email) {
  return getWorkers().find(
    (worker) => worker.email === email
  );
}

function findWorkerById(workerId) {
  return getWorkers().find(
    (worker) => worker.worker_id === workerId
  );
}

function addWorker(worker) {
  const data = loadDatabase();
  data.workers.push(worker);
  saveDatabase(data);
  return worker;
}

function countWorkers() {
  return getWorkers().length;
}

module.exports = {
  getWorkers,
  findWorkerByEmail,
  findWorkerById,
  addWorker,
  countWorkers
};
