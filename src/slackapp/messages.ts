import app from '~/slackapp/app';
const { subtype } = require('@slack/bolt');
import { sendStandupRequestMessage } from '~/slackapp/common/message';

// https://github.com/SlackAPI/bolt#listener-middleware
app.message(subtype('bot_message'), async ({ message, context }) => {
  switch (message.text) {
    case '/standup-request':
      await sendStandupRequestMessage(
        {
          channelId: message.channel,
          userId: message.bot_id
        },
        context
      );
      break;
  }
});

export default app;
