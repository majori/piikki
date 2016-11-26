## Get started

1. Install NodeJS (v6.9.1) and PostgreSQL
2. In PostgreSQL run `CREATE ROLE piikki WITH PASSWORD 'piikki';` and `CREATE DATABASE piikkiDB WITH OWNER piikki;`
3. Clone this repository and run `npm install`
4. Build project `npm run build`
5. Initialize database `npm run migrate`
4. Start server `npm start`