require('dotenv').config()

module.exports = {
  migrationsTable: 'pgmigrations',
  dir: 'src/db/migrations', // ✅ 마이그레이션 파일 생성 위치 지정
  direction: 'up',
  databaseUrl: process.env.DATABASE_URL,
}