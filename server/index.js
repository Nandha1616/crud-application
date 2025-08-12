const express = require("express");
const cors = require("cors");
const { Client } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const client = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_m89tudKGnjCz@ep-sparkling-recipe-aeryw8lm-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
});

client
  .connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("PostgreSQL connection error", err));

// Routes

// Get all users
app.get("/", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get user by ID
app.get("/getUser/:id", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM users WHERE id = $1", [
      req.params.id,
    ]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update user
app.put("/update/:id", async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const result = await client.query(
      "UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *",
      [name, email, age, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete user
app.delete("/delete/:id", async (req, res) => {
  try {
    await client.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create user
app.post("/create", async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const result = await client.query(
      "INSERT INTO users (name, email, age) VALUES ($1, $2, $3) RETURNING *",
      [name, email, age]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(3001, () => {
  console.log("Server is running");
});
