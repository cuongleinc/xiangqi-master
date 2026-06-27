import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'xiangqi',
  password: process.env.DATABASE_PASSWORD || 'xiangqi_dev',
  database: process.env.DATABASE_NAME || 'xiangqi',
  ssl: process.env.DATABASE_SSL === 'true',
}));
