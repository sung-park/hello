#!/bin/sh
set -e

echo "DB 초기화 중..."
node init-db.js

echo "Next.js 서버 시작..."
exec node server.js
