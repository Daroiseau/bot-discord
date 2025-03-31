const { Pool } = require('pg');

const pool = new Pool({
  user: 'bddpablo_user',
  host: 'dpg-cvl81bffte5s739tcta0-a.frankfurt-postgres.render.com',
  database: 'bddpablo',
  password: 'VOiMwZADHc23C6dNZyfFmfIqSrcn2gJa',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;