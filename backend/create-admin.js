require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("./database");

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || "Vicky Web Fix Admin";

  if (!email || !password) {
    console.error(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required."
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error(
      "ADMIN_PASSWORD must contain at least 8 characters."
    );
    process.exit(1);
  }

  await db.initDatabase();

  const existing = await db.query(
    "SELECT id FROM users WHERE email = $1",
    [email.trim().toLowerCase()]
  );

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  if (existing.rowCount) {
    await db.query(
      `
      UPDATE users
      SET
        name = $1,
        password_hash = $2,
        role = 'admin',
        status = 'active'
      WHERE email = $3
      `,
      [
        name,
        passwordHash,
        email.trim().toLowerCase(),
      ]
    );

    console.log("Admin account updated.");
  } else {
    await db.query(
      `
      INSERT INTO users
        (name, email, password_hash, role, status)
      VALUES
        ($1, $2, $3, 'admin', 'active')
      `,
      [
        name,
        email.trim().toLowerCase(),
        passwordHash,
      ]
    );

    console.log("Admin account created.");
  }

  await db.pool.end();
}

main().catch((error) => {
  console.error("Admin setup failed:", error);
  process.exit(1);
});
