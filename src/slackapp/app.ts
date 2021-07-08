import { App, AuthorizeResult, LogLevel } from '@slack/bolt';
import expressReceiver from '~/receiver';
import Workspace from '~/models/workspace';

const authorizeFn = async ({ teamId }): Promise<AuthorizeResult> => {
  const workspace = await Workspace.read(teamId);
  if (workspace) {
    return {
      botToken: workspace.botToken,
      botId: workspace.botId,
      botUserId: workspace.botUserId,
    };
  }
  throw new Error('No matching authorizations');
};

const app = new App({
  receiver: expressReceiver,
  authorize: authorizeFn,
  logLevel:
    process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
});

export default app;
