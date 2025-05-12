const mysql = require('mysql2/promise');

const config = {
  host: 'yamanote.proxy.rlwy.net',
  port: 55369,
  user: 'root',
  password: 'uAqWvbvDfJqSQxpunqLKUnRnxkqhScGh',
  database: 'railway'
};

async function connectDB() {
  try {
    const connection = await mysql.createConnection(config);
    console.log('Conexión exitosa a MySQL');
    return connection;
  } catch (err) {
    console.error('Error al conectar a MySQL:', err.message);
    throw err;
  }
}

module.exports = { connectDB };
