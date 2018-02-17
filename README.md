![Piikki Logo](https://raw.githubusercontent.com/majori/piikki/development/docs/piikki-logo-title.png)
------

[![Build Status](https://ci.appveyor.com/api/projects/status/dslktag9a01mnvfq?svg=true)](https://ci.appveyor.com/project/majori/piikki)

_Piikki_ is a pre-payment system for small societies such as university clubs and non-profit organizations. Its purpose is to replace the classic tab-paper-sheet taped on the fridge door and offer users an easy way to check off refreshments and keep book of their own tab saldo.

_Piikki_ is designed to handle multiple user groups with one backend service. This allows users to have tab saldos in different groups and the possibility to use them all within one client application.

This github project only includes server backend and api of the Piikki pre-payment system.

**Clients currently under development:**
- [RFID-reader](https://github.com/juilijoel/piikki-client-rfid) by [juilijoel](https://github.com/juilijoel)
- [Telegram bot](https://github.com/majori/piikki-client-tg) by [majori](https://github.com/majori)
- [Web UI](https://github.com/majori/piikki-client-web) by [majori](https://github.com/majori)
- [Desktop](https://github.com/majori/piikki-client-desktop) by [majori](https://github.com/majori)

If you are interested of making your own Piikki client and use our hosted backend service, please contact the [author](https://github.com/majori) to aquire your very own token!

# Architechture

Here is a high-level architechture model of the system.

![Piikki high-level model](https://raw.githubusercontent.com/majori/piikki/development/docs/high-level.png)

# API

[API Definition](https://piikki.ddns.net/swagger/ui/)

[Postman collection](https://raw.githubusercontent.com/majori/piikki/development/docs/piikki.postman_collection.json)

# Development
- Install [node.js](https://nodejs.org/en/) and [Docker](https://www.docker.com/community-edition)
- Run `npm install`
- Create local database with `docker-compose -d up`
- Copy contents of `.env-sample` to new file called `.env`
- Initialize database with `npm run init-db`
- Run `npm run dev` to start the server
