const { createClient } = require('@libsql/client')

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const client = createClient({ url })

async function init() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS "About" (
      "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
      "name" TEXT NOT NULL DEFAULT '',
      "title" TEXT NOT NULL DEFAULT '',
      "tagline" TEXT NOT NULL DEFAULT '',
      "bio" TEXT NOT NULL DEFAULT '',
      "avatarUrl" TEXT,
      "resumeUrl" TEXT,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "titleEn" TEXT NOT NULL DEFAULT '',
      "taglineEn" TEXT NOT NULL DEFAULT '',
      "bioEn" TEXT NOT NULL DEFAULT '',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Experience" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "company" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "startDate" TEXT NOT NULL,
      "endDate" TEXT,
      "description" TEXT NOT NULL,
      "techStack" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "roleEn" TEXT NOT NULL DEFAULT '',
      "companyEn" TEXT NOT NULL DEFAULT '',
      "descriptionEn" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "techStack" TEXT NOT NULL,
      "repoUrl" TEXT,
      "liveUrl" TEXT,
      "imageUrl" TEXT,
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "titleEn" TEXT NOT NULL DEFAULT '',
      "descriptionEn" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "SocialLink" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "platform" TEXT NOT NULL,
      "url" TEXT NOT NULL,
      "icon" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Playground" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "techStack" TEXT NOT NULL,
      "repoUrl" TEXT,
      "liveUrl" TEXT,
      "imageUrl" TEXT,
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "titleEn" TEXT NOT NULL DEFAULT '',
      "descriptionEn" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Setting" (
      "key" TEXT NOT NULL PRIMARY KEY,
      "value" TEXT NOT NULL,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  console.log('DB 초기화 완료')
  client.close()
}

async function migrate() {
  const alters = [
    `ALTER TABLE "About" ADD COLUMN "nameEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "titleEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "taglineEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "bioEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "roleEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "companyEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "descriptionEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Project" ADD COLUMN "titleEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Project" ADD COLUMN "descriptionEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Playground" ADD COLUMN "titleEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Playground" ADD COLUMN "descriptionEn" TEXT NOT NULL DEFAULT ''`,
  ]
  for (const sql of alters) {
    try { await client.execute(sql) } catch (_) { /* 컬럼 이미 존재 시 skip */ }
  }
}

init()
  .then(migrate)
  .catch(err => {
    console.error('DB 초기화 실패:', err)
    process.exit(1)
  })
