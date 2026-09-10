const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
  pool: {
    max: 15,
    min: 2,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 5,
    match: [/SQLITE_BUSY/],
    backoffBase: 100,
    backoffExponent: 1.5
  }
});

// Configure High-Concurrency SQLite PRAGMAs
sequelize.beforeConnect(async (config) => {
  // Configured before opening connections
});

sequelize.afterConnect((connection, config) => {
  if (connection && typeof connection.run === 'function') {
    connection.run('PRAGMA journal_mode = WAL;');
    connection.run('PRAGMA busy_timeout = 10000;');
    connection.run('PRAGMA synchronous = NORMAL;');
    connection.run('PRAGMA cache_size = -64000;'); // 64MB memory cache for high throughput
  }
});

module.exports = sequelize;
