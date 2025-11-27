# rengar

minimal valorant api. no auth, json responses.

## endpoints

| endpoint                    | description            |
| --------------------------- | ---------------------- |
| `/api/mmr/{name}/{tag}`     | player rank            |
| `/api/stats/{name}/{tag}`   | current act stats      |
| `/api/account/{name}/{tag}` | puuid and account info |
| `/api/matches/{name}/{tag}` | match history          |
| `/api/match/{id}`           | match details          |
| `/api/leaderboard/{actId}`  | ranked leaderboard     |
| `/api/content`              | agents, maps, modes    |
| `/api/status/valorant`      | server status          |

## usage

```
https://reng.ar/api/mmr/my%20melody/aaa
```

```json
{
  "name": "my melody",
  "tag": "aaa",
  "region": "eu",
  "rank": "Ascendant 3",
  "card": "adb00c74-4505-4e29-e359-74adfc0ead87"
}
```

## twitch

```
$(customapi.https://reng.ar/api/mmr/$(1)/$(2))
```

## docs

https://reng.ar/docs

## license

mit
