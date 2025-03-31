const { Pool } = require('pg');

const pool = new Pool({
  user: 'bot_discord_bdd_user',
  host: 'dpg-cvl81bffte5s739tcta0-a.frankfurt-postgres.render.com',
  database: 'bot_discord_bdd',
  password: '0SAktUZCKrbCncs5IyRMPNdz3ort0a9j',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;