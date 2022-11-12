#!/bin/bash
echo 'Run migrations and app - development'
npm run db:migrate:dev
npm run db:seed:dev
npm run dev
exec "$@"
