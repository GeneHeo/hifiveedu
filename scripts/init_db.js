const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS users");
  db.run("DROP TABLE IF EXISTS students");
  db.run("DROP TABLE IF EXISTS parents");
  db.run("DROP TABLE IF EXISTS admins");
  db.run("DROP TABLE IF EXISTS schedules");
  db.run("DROP TABLE IF EXISTS homework");

  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    role TEXT CHECK(role IN ('admin', 'student', 'parent'))
  )`);
  db.run(`CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    student_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`);
  db.run(`CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
  db.run(`CREATE TABLE schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    week TEXT,
    data TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`);
  db.run(`CREATE TABLE homework (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    week TEXT,
    drive_link TEXT,
    FOREIGN KEY(student_id) REFERENCES students(id)
  )`);

  // Seed admins
  db.run("INSERT INTO users (name, email, role) VALUES (?, ?, ?)", ["HiFive Admin", "hifsteamedu@gmail.com", "admin"]);
  db.run("INSERT INTO users (name, email, role) VALUES (?, ?, ?)", ["Gene Heo", "geneheo21@gmail.com", "admin"]);
});

db.close();
