# slackbot-standup

- input your standup `/standup`

![standup](https://user-images.githubusercontent.com/1042519/102229611-58c12d80-3f2f-11eb-9167-3c79bb8f5986.png)

- share to your teams

![share](https://user-images.githubusercontent.com/1042519/102229604-56f76a00-3f2f-11eb-9344-d6320af7c278.png)

## try demo slack app

<a href="https://slack.com/oauth/v2/authorize?client_id=10676060560.867151635030&scope=chat:write,commands,users.profile:read,users:read"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>

## Note

This demo slack app stores the latest standup data in my personal GCP account, Cloud Datastore.
Therefore, **do not include sensitive information**.
I recommend self-hosting with your own GCP account if you want to include sensitive information.

# development

## init

```
cp .env.sample .env
cp docker-compose.override.yml.sample docker-compose.override.yml
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
- channels:history

### Event Subscriptions

#### Request URL

https://{bot_url}/slack/events

#### Subscribe to bot events

- message.channels

### Interactive Components

#### Request URL

https://{bot_url}/slack/events

#### Actions

- Name: Today's Standup
- Short Description: input today's standup
- Callback ID: input_standup

![standup_action](https://user-images.githubusercontent.com/1042519/76507178-ac2db900-648f-11ea-8a11-35d5a9f059cd.png)

### Slash Commands

#### /standup

- Command: /standup
- Request URL: https://{bot_url}/slack/events
- Short Description: daily standup

#### /standup-setting

- Command: /standup-setting
- Request URL: https://{bot_url}/slack/events
- Short Description: standup global settings

#### /standup-request

- Command: /standup-request
- Request URL: https://{bot_url}/slack/events
- Short Description: show standup button

#### /standup-list-work-place

- Command: /standup-list-work-place
- Request URL: https://{bot_url}/slack/events
- Short Description: show everyone's work place

# refs

- [Slack | Bolt](https://slack.dev/bolt/tutorial/getting-started)
