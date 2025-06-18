import pkg from 'pg';
const {Pool} = pkg;

const pool = new Pool({
  user: 'bddpablo_user',
  host: 'dpg-cvl81bffte5s739tcta0-a.frankfurt-postgres.render.com',
  database: 'bddpablo',
  password: 'VOiMwZADHc23C6dNZyfFmfIqSrcn2gJa',
  port: 5432,
  ssl: true //pour render 
 /* ssl: {
    rejectUnauthorized: false
  }*/
});

export default pool;