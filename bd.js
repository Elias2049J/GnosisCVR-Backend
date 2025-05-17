import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
        ca: process.env.PG_SSL_CERT
     }
});

export default pool;