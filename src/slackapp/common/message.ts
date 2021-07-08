import { KnownBlock, Block } from '@slack/types';
import app from '~/slackapp/app';
import { getToday } from '~/slackapp/common/date';
import Standup from '~/models/standup';
import { SayFn } from '@slack/bolt';

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
            text: '下のボタンから投稿できます :pray:',
          },
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
                text: "input today's standup",
              },
              style: 'primary',
            },
          ],
        },
      ],
    });
  } catch (error) {
    await app.client.chat
      .postEphemeral({
        token: context.botToken,
        user: args.userId,
        channel: args.userId,
        text: `Sorry, an error has occurred.\n${
          error.data.response_metadata.messages
            ? error.data.response_metadata.messages.join('\n')
            : error.data.error
        }`,
      })
      .catch((err) => {
        console.error(JSON.stringify(err));
      });
    console.error(JSON.stringify(error));
  }
};

type ListWorkPlaceMessageArguments = {
  userId: string;
  teamId: string;
  say: SayFn;
};

export const sendListWorkPlaceMessage = async (
  args: ListWorkPlaceMessageArguments,
  context
) => {
  const today = await getToday(args.teamId);
  const standups = await Standup.listByPostDate(args.teamId, today.toJSON());
  const filteredStandups = standups.filter(
    (standup) => standup.workPlace !== ''
  );

  const blocks: (KnownBlock | Block)[] = [
    {
      type: 'section',
      text: {
        type: 'plain_text',
        text: `:memo: ${today.format('MM/DD')}の勤怠連絡`,
        emoji: true,
      },
    },
  ];

  filteredStandups.forEach((standup) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${standup.userName}*\n- 作業場所: *${standup.workPlace}*\n- 連絡事項: ${standup.information}\n- 気分: ${standup.status}`,
      },
    });
    blocks.push({
      type: 'divider',
    });
  });

  try {
    await args.say({
      text: '',
      blocks,
    });
  } catch (error) {
    await app.client.chat
      .postEphemeral({
        token: context.botToken,
        user: args.userId,
        channel: args.userId,
        text: `Sorry, an error has occurred.\n${
          error.data.response_metadata.messages
            ? error.data.response_metadata.messages.join('\n')
            : error.data.error
        }`,
      })
      .catch((err) => {
        console.error(JSON.stringify(err));
      });
    console.error(JSON.stringify(error));
  }
};
