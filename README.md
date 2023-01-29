# Radiodiagnostic
## How to run
- set up postges database https://github.com/khezen/compose-postgres/blob/master/docker-compose.yml
- install nodejs ^14.x.x: https://nodejs.org/en/
- open backend folder
- install all dependencies # npm install
- copy .env.example to .env and edit related fields
- create database in postgresql on pgadmin
- migrate all column to database # npm run migrate up
- run application # npm run start-dev
