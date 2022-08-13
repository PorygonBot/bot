# Porygon
![](https://images.discordapp.net/avatars/692091256477581423/634148e2b64c4cd5e555d9677188e1e2.png?size=512)
A Discord bot that tracks stats in a Pokemon Showdown battle.

## Usage
### Requirements
- npm
- PostgreSQL

### Setup
1. You'll need to setup a Discord application and bot. You can find instructions on how to setup a bot [here](https://discordpy.readthedocs.io/en/stable/discord.html). 
2. You'll also need to setup a PostgreSQL server. You can find instructions on how to install PostgreSQL [here](https://www.postgresqltutorial.com/postgresql-getting-started/install-postgresql/) and connect to a PostgreSQL server [here](https://www.postgresqltutorial.com/postgresql-getting-started/connect-to-postgresql-database/).
3. You'll also need a Pokemon Showdown account. Just go [here](https://play.pokemonshowdown.com), create a username, and add a password to this username.
4. You'll also need a draft-league.nl API key. Good luck getting that though lmao. The bot will work fine without it, you just won't be able to use the DL updating method.
5. You'll also need a Google service account. Google is slowly phasing these out from their developer program, but for Google Sheets they still work. You can find out how to setup a service account [here](https://cloud.google.com/iam/docs/creating-managing-service-accounts). Copy the JSON from this service account.

### Commands (in order)
```bash
$ git clone git@github.com:PorygonBot/bot-ts.git
$ cd bot-ts
$ touch .env
$ npm install
$ npx run migrate
$ npm run start
```
Your `.env` should look like this:
```
TOKEN=
DATABASE_URL=
PS_USERNAME=
PS_PASSWORD=
DL_API_KEY=
DL_API_URL=
GOOGLE_SERVICE_ACCOUNT=
```

## Credits
- The [Pokefinium Discord Server](https://discord.gg/JPWHF7X) for inspiration
- MewsTheBest for the art
    - [Twitter](https://twitter.com/Mewsthebset)
    - [Portfolio](https://themewsthebest-portfolio.weebly.com/)
- [@koreanpanda345](https://github.com/koreanpanda345) for general help with the code
- [@rishiosaur](https://github.com/rishiosaur) for async & Google Sheets help

## [License](https://choosealicense.com/licenses/gpl-3.0/)