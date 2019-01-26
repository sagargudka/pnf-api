'use strict';

const { DATABASE_URL } = process.env;
const { Client } = require('pg');
const _ = require('underscore');


module.exports = {
  get,
}

async function get(tableName) {
  console.log('attempting to fetch');
  let dbClient;
  try {
    dbClient = new Client({ connectionString: DATABASE_URL });

    await dbClient.connect();

    let result = await dbClient.query(`Select * from ${tableName}`);

    console.log(result);
    await dbClient.end();

    return _.map(result.rows, row => row.data);
  } catch (err) {
    console.log(err);
    if (dbClient) {
      await dbClient.end();
    }
    throw err;
  }
}
