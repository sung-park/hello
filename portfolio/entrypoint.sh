#!/bin/sh
set -e

echo "Prisma 마이그레이션 실행 중..."
node node_modules/prisma/dist/bin.js migrate deploy --schema=./prisma/schema.prisma

echo "Next.js 서버 시작..."
exec node server.js
