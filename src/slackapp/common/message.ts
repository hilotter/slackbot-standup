import app from '~/slackapp/app';

type MessageArguments = {
  channelId: string;
  userId: string;
};

export const sendStandupRequestMessage = async (
  args: MessageArguments,
  context
) => {
  try {
    await app.client.chat.postMessage({
      text: '',
      token: context.botToken,
      channel: args.channelId,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '下のボタンから投稿できます :pray:'
          }
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              action_id: 'show_standup_modal',
              text: {
                type: 'plain_text',
                emoji: true,
                text: "input today's standup"
              },
              style: 'primary'
            }
          ]
        }
      ]
    });
  } catch (error) {
    await app.client.chat
      .postEphemeral({
        token: context.botToken,
        user: args.userId,
        channel: args.userId,
        text: `Sorry, an error has occurred. ${error.data.error}`
      })
      .catch((err) => {
        console.error(err);
      });
    console.error(error);
  }
};
