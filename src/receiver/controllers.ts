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
  res.write(
    `<a href="https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=chat:write,commands,users.profile:read"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"></a>`
  );
  res.end();
});

expressReceiver.app.get('/auth/direct', (_, res) => {
  // Slack API > your app > Manage Distribution > Sharable URL
  res.redirect(process.env.SLACK_INSTALL_SHARABLE_URL!);
  res.end();
});

expressReceiver.app.get('/auth/callback', async (req, res) => {
  if (req.query.error) {
    res.write(`Authentication failed: ${req.query.error}`);
    res.end();
    return;
  }

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

  res.redirect('/auth/complete');
  res.end();
});

expressReceiver.app.get('/auth/complete', async (req, res) => {
  res
    .status(200)
    .send(
      'install completed. please input "/standup-setting" in your slack team.'
    );
});

export default expressReceiver;
