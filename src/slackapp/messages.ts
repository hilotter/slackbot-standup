import app from '~/slackapp/app';
import { subtype, BotMessageEvent } from '@slack/bolt';
import { sendStandupRequestMessage } from '~/slackapp/common/message';

// https://github.com/SlackAPI/bolt#listener-middleware
app.message(subtype('bot_message'), async (args) => {
  const { context } = args;
  const message = args.message as BotMessageEvent;

  switch (message.text) {
    case '/standup-request':
      await sendStandupRequestMessage(
        {
          channelId: message.channel,
          userId: message.bot_id,
        },
        context
      );
      break;
  }
});

export default app;
