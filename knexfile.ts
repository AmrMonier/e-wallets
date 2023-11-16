// At the top of your knexfile.js
import * as dotenv from 'dotenv';
dotenv.config({ path: './env/development.env' });
import {} from 'knex';
interface KnexConfig {
  [key: string]: object;
}

export default {
  // Use environment variables
  development: {
    client: 'postgresql',
    connection: {
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      host: process.env.DATABASE_HOST,
    },
    migrations: {
      // ...
    },
  },
  // ...
};
