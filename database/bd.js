import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'postgres.railway.internal',
  database: 'railway',
  password: 'LiNfHIMmyivSUeYBzTZlmkYTqPLUZiKr',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;