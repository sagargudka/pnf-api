'use strict';

const { DATABASE_URL } = process.env;
const { Client } = require('pg');

const dbClient = new Client({ connectionString: DATABASE_URL });

module.exports = {
  get,
}

async function get(tableName) {
  try {
    let result = await dbClient.connect()
      .then(() => dbClient.query(`Select * from ${tableName}`));

    dbClient.end();

    return _.map(result.rows, row => row.data);
  } catch (err) {
    dbClient.end();

    throw err;
  }
}
