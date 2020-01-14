import Workspace from '~/models/workspace';
import { OAuthV2AccessResult, BotInfoResult } from '~/types';
import expressReceiver from '~/receiver/expressReceiver';
import app from '~/slackapp/app';

expressReceiver.app.get('', (_, res) => {
  res.status(200).send();
});

// https://github.com/slackapi/bolt/issues/302#issuecomment-548221661
expressReceiver.app.get('/auth/add', (_, res) => {
  // Slack API > your app > Manage Distribution > Embeddable slack button
  res.write(process.env.SLACK_INSTALL_EMBEDDABLE_SLACK_BUTTON!);
  res.end();
});

expressReceiver.app.get('/auth/direct', (_, res) => {
  // Slack API > your app > Manage Distribution > Sharable URL
  res.redirect(process.env.SLACK_INSTALL_SHARABLE_URL!);
  res.end();
});

expressReceiver.app.get('/auth/callback', async (req, res) => {
  const data = (await app.client.oauth.v2.access({
    client_id: process.env.SLACK_CLIENT_ID!,
    client_secret: process.env.SLACK_CLIENT_SECRET!,
    code: req.query.code
  })) as OAuthV2AccessResult;

  const botInfo = (await app.client.users.info({
    token: data.access_token,
    user: data.bot_user_id
  })) as BotInfoResult;

  Workspace.add({
    teamId: data.team.id,
    botInfo: {
      botToken: data.access_token,
      botUserId: data.bot_user_id,
      botId: botInfo.user.profile.bot_id
    }
  });

  res.status(201).send('OK');
});

export default expressReceiver;
