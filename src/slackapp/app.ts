import { App, AuthorizeResult } from '@slack/bolt';
import expressReceiver from '~/receiver/expressReceiver';
import Workspace from '~/models/workspace';

const authorizeFn = async ({ teamId }): Promise<AuthorizeResult> => {
  const workspace = await Workspace.read(teamId);
  if (workspace) {
    return {
      botToken: workspace.botToken,
      botId: workspace.botId,
      botUserId: workspace.botUserId
    };
  }
  throw new Error('No matching authorizations');
};

// Initializes your app with your bot token and signing secret
const app = new App({
  receiver: expressReceiver,
  authorize: authorizeFn
});

export default app;
