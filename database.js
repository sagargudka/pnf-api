'use strict';

const { DATABASE_URL } = process.env;
const { Client } = require('pg');
const _ = require('underscore');


module.exports = {
  get,
  insert,
}

async function get(tableName) {
  let dbClient;
  try {
    dbClient = new Client({ connectionString: DATABASE_URL });

    await dbClient.connect();

    let result = await dbClient.query(`Select * from ${tableName}`);

    await dbClient.end();

    return result && result.rows && result.rows.length ? _.map(result.rows, row => row.data) : [];
  } catch (err) {
    if (dbClient) {
      await dbClient.end();
    }
    throw err;
  }
}

async function insert(tableName, data) {
  let dbClient;
  try {
    dbClient = new Client({ connectionString: DATABASE_URL });

    await dbClient.connect();

    let result = await dbClient.query(
      `INSERT into ${tableName}(id, data) values ($1, $2)`,
      [data.id, JSON.stringify(data)]
    );

    await dbClient.end();

    return result;
  } catch (err) {
    if (dbClient) {
      await dbClient.end();
    }
    throw err;
  }
}
