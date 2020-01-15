# slackbot-standup

<a href="https://slack.com/oauth/v2/authorize?client_id=10676060560.867151635030&scope=chat:write,commands,users.profile:read,users:read"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>

# development
## init

```
cp .env.sample .env
docker-compose build
docker-compose up
```

## Slack App Setting
### OAuth & Permissions
#### Redirect URLs

https://{bot_url}/auth/callback

#### Scopes
- chat:write
- commands
- users:read
- users.profile:read

### Event Subscriptions
#### Request URL

https://{bot_url}/slack/events

### Interactive Components
#### Request URL

https://{bot_url}/slack/events

### Slash Commands
#### /standup
- Command: /standup
- Request URL: https://{bot_url}/slack/events
- Short Description: daily standup

#### /standup-setting
- Command: /standup-setting
- Request URL: https://{bot_url}/slack/events
- Short Description: standup global settings

# TODO
- [ ] custom questions

# refs
- [Slack | Bolt](https://slack.dev/bolt/tutorial/getting-started)
