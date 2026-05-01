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

    CREATE TABLE IF NOT EXISTS "Education" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "school" TEXT NOT NULL,
      "degree" TEXT NOT NULL,
      "field" TEXT NOT NULL,
      "startDate" TEXT NOT NULL,
      "endDate" TEXT,
      "gpa" TEXT NOT NULL DEFAULT '',
      "description" TEXT NOT NULL DEFAULT '',
      "schoolEn" TEXT NOT NULL DEFAULT '',
      "degreeEn" TEXT NOT NULL DEFAULT '',
      "fieldEn" TEXT NOT NULL DEFAULT '',
      "descriptionEn" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Certification" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "issuer" TEXT NOT NULL,
      "issueDate" TEXT NOT NULL,
      "expiryDate" TEXT,
      "credentialId" TEXT NOT NULL DEFAULT '',
      "credentialUrl" TEXT NOT NULL DEFAULT '',
      "nameEn" TEXT NOT NULL DEFAULT '',
      "issuerEn" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Award" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "issuer" TEXT NOT NULL,
      "date" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "titleEn" TEXT NOT NULL DEFAULT '',
      "issuerEn" TEXT NOT NULL DEFAULT '',
      "descriptionEn" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "SkillCategory" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Skill" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "categoryId" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL DEFAULT '',
      "level" INTEGER,
      "years" INTEGER,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS "Skill_categoryId_idx" ON "Skill"("categoryId");

    CREATE TABLE IF NOT EXISTS "Patent" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "patentNumber" TEXT NOT NULL DEFAULT '',
      "country" TEXT NOT NULL DEFAULT '',
      "status" TEXT NOT NULL DEFAULT 'granted',
      "filingDate" TEXT NOT NULL DEFAULT '',
      "grantDate" TEXT NOT NULL DEFAULT '',
      "inventors" TEXT NOT NULL DEFAULT '',
      "url" TEXT NOT NULL DEFAULT '',
      "summary" TEXT NOT NULL DEFAULT '',
      "titleEn" TEXT NOT NULL DEFAULT '',
      "inventorsEn" TEXT NOT NULL DEFAULT '',
      "summaryEn" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Language" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "proficiency" TEXT NOT NULL,
      "testName" TEXT NOT NULL DEFAULT '',
      "score" TEXT NOT NULL DEFAULT '',
      "nameEn" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Publication" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "type" TEXT NOT NULL DEFAULT 'talk',
      "venue" TEXT NOT NULL DEFAULT '',
      "date" TEXT NOT NULL,
      "description" TEXT NOT NULL DEFAULT '',
      "url" TEXT NOT NULL DEFAULT '',
      "titleEn" TEXT NOT NULL DEFAULT '',
      "venueEn" TEXT NOT NULL DEFAULT '',
      "descriptionEn" TEXT NOT NULL DEFAULT '',
      "order" INTEGER NOT NULL DEFAULT 0,
      "published" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  console.log('DB 초기화 완료')
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
    `ALTER TABLE "About" ADD COLUMN "email" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "phone" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "location" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "birthYear" INTEGER`,
    `ALTER TABLE "About" ADD COLUMN "summary" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "locationEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "About" ADD COLUMN "summaryEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "location" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "current" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "Experience" ADD COLUMN "summary" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "achievements" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "locationEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "summaryEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Experience" ADD COLUMN "achievementsEn" TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE "Patent" ADD COLUMN "count" INTEGER NOT NULL DEFAULT 1`,
  ]
  for (const sql of alters) {
    try { await client.execute(sql) } catch (_) { /* 컬럼 이미 존재 시 skip */ }
  }
  console.log('DB 마이그레이션 완료')
  client.close()
}

init()
  .then(migrate)
  .catch(err => {
    console.error('DB 초기화 실패:', err)
    process.exit(1)
  })
