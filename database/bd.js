const { Pool } = require('pg');

const pool = new Pool({
  user: 'bot_discord_bdd_user',
  host: 'dpg-cvl81bffte5s739tcta0-a.frankfurt-postgres.render.com',
  database: 'bot_discord_bdd',
  password: 'VOiMwZADHc23C6dNZyfFmfIqSrcn2gJa',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;