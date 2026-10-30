'use strict';
require('dotenv').config();

const express      = require('express');
const path         = require('path');
const cookieParser = require('cookie-parser');
const cors         = require('cors');

const { initDB }  = require('./src/db');
const authRouter  = require('./src/routes/auth');
const booksRouter = require('./src/routes/books');
const usersRouter = require('./src/routes/users');
const adminRouter = require('./src/routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth',  authRouter);
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('*',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.use((err, req, res, _next) => {
  console.error(err.stack || err);
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "Fayl hajmi juda katta (Maksimal ruxsat: 250 MB)" });
    }
    return res.status(400).json({ error: `Yuklashda xatolik: ${err.message}` });
  }
  res.status(err.status || 500).json({ error: err.message || 'Server xatosi' });
});

// sql.js initDB is async — must await before listening
if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`\n✅ KAMOLOT server ishga tushdi!`);
      console.log(`   Sayt:        http://localhost:${PORT}`);
      console.log(`   Admin panel: http://localhost:${PORT}/admin`);
      console.log(`\n   Admin login: admin / Kamolot@Admin2024!\n`);
    });
  }).catch(err => {
    console.error('DB initsializatsiyada xato:', err);
    process.exit(1);
  });
}

module.exports = { app, initDB };
