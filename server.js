const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db.sqlite3');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: 'YOUR_CLIENT_ID.apps.googleusercontent.com', // Put your Google Client ID here!
    clientSecret: 'YOUR_CLIENT_SECRET',                    // Put your Google Client Secret here!
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    db.get("SELECT * FROM users WHERE email = ?", [profile.emails[0].value], (err, row) => {
      if (row) return cb(null, row);
      // Default to student if not admin
      let role = ['hifsteamedu@gmail.com', 'geneheo21@gmail.com'].includes(profile.emails[0].value) ? 'admin' : 'student';
      db.run("INSERT INTO users (name, email, role) VALUES (?, ?, ?)", [profile.displayName, profile.emails[0].value, role], function(err) {
        db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, row) => {
          cb(null, row);
        });
      });
    });
  }
));
passport.serializeUser((user, done) => { done(null, user.id); });
passport.deserializeUser((id, done) => {
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => { done(err, row); });
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/student_manage.html');
  });

app.get('/api/user', (req, res) => {
  if (!req.user) return res.json({ authenticated: false });
  res.json({ authenticated: true, user: req.user });
});

app.get('/api/student/schedule', (req, res) => {
  if (!req.user || req.user.role !== 'student') return res.status(403).json({ error: 'Not allowed' });
  db.get("SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.email = ?", [req.user.email], (err, row) => {
    if (!row) return res.json({ schedule: [] });
    db.all("SELECT week, data FROM schedules WHERE student_id = ?", [row.id], (err, rows) => {
      res.json({ schedule: rows });
    });
  });
});

app.get('/api/admin/students', (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  db.all("SELECT u.id, u.name, u.email FROM users u WHERE u.role = 'student'", (err, rows) => {
    res.json({ students: rows });
  });
});

app.post('/api/admin/schedule', (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  const { student_id, week, data } = req.body;
  db.run("INSERT INTO schedules (student_id, week, data) VALUES (?, ?, ?)", [student_id, week, data], function(err) {
    res.json({ ok: true });
  });
});

app.post('/api/student/homework', (req, res) => {
  if (!req.user || req.user.role !== 'student') return res.status(403).json({ error: 'Not allowed' });
  const { week, drive_link } = req.body;
  db.get("SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE u.email = ?", [req.user.email], (err, row) => {
    if (!row) return res.json({ error: 'No student found' });
    db.run("INSERT INTO homework (student_id, week, drive_link) VALUES (?, ?, ?)", [row.id, week, drive_link], function(err) {
      res.json({ ok: true });
    });
  });
});

app.get('/api/admin/homework/:student_id', (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Not allowed' });
  db.all("SELECT week, drive_link FROM homework WHERE student_id = ?", [req.params.student_id], (err, rows) => {
    res.json({ homework: rows });
  });
});

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
