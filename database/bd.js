const { Pool } = require('pg');

const pool = new Pool({
  user: 'bot_discord_bdd_user',
  host: 'dpg-ctuh1123esus739c7350-a.frankfurt-postgres.render.com',
  database: 'bot_discord_bdd',
  password: '0SAktUZCKrbCncs5IyRMPNdz3ort0a9j',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;