import { UserInfoResult } from '~/types';
import app from '~/slackapp/app';
import Standup from '~/models/standup';
import Setting from '~/models/setting';
import { getToday } from '~/slackapp/common/date';
import { SayFn } from '@slack/bolt';

type ShowStandupModalArguments = {
  triggerId: string;
  teamId: string;
  userId: string;
};

export const showStandupModal = async (
  args: ShowStandupModalArguments,
  context
) => {
  try {
    // https://github.com/slackapi/node-slack-sdk/issues/1131
    const res = await app.client.views.open({
      token: context.botToken,
      trigger_id: args.triggerId,
      view: {
        type: 'modal',
        callback_id: 'standup',
        title: {
          type: 'plain_text',
          text: 'Daily Standup',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true,
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text:
                ':man-biking: Loading...\n\nIf the loading does not complete after 10 seconds, click the Cancel button and run /standup again.',
            },
          },
        ],
      },
    });

    if (res.error) {
      console.log(res.response_metadata);
      throw Error(res.error);
    }

    const viewId = (res.view as {
      id: string;
    }).id;
    const latestStandup = await Standup.read(args.teamId, args.userId);
    const today = await getToday(args.teamId);
    const isUpdate = latestStandup && latestStandup.postDate === today.toJSON();

    await app.client.views.update({
      token: context.botToken,
      view_id: viewId,
      view: {
        type: 'modal',
        callback_id: 'standup',
        title: {
          type: 'plain_text',
          text: 'Daily Standup',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: isUpdate ? 'Update' : 'Submit',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true,
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: `:wave: Hello!\n\n${today.format(
                'MM/DD'
              )} 今日の気分を教えてね :sunny:`,
              emoji: true,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'input',
            block_id: 'standup_status',
            label: {
              type: 'plain_text',
              text: ':sunrise: 今日の気分はどうですか？',
              emoji: true,
            },
            element: {
              type: 'static_select',
              action_id: 'select',
              placeholder: {
                type: 'plain_text',
                text: 'Select an item',
                emoji: true,
              },
              initial_option: isUpdate
                ? {
                    text: {
                      type: 'plain_text',
                      text: latestStandup.status,
                      emoji: true,
                    },
                    value: latestStandup.status,
                  }
                : undefined,
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '最高',
                    emoji: true,
                  },
                  value: '最高',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'いいかんじ',
                    emoji: true,
                  },
                  value: 'いいかんじ',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'ちょっとわるい',
                    emoji: true,
                  },
                  value: 'ちょっとわるい',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'きびしい',
                    emoji: true,
                  },
                  value: 'きびしい',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'もうダメ、だれか助けて',
                    emoji: true,
                  },
                  value: 'もうダメ、だれか助けて',
                },
              ],
            },
          },
          {
            type: 'input',
            block_id: 'standup_last_time_todo',
            label: {
              type: 'plain_text',
              text: ':bee: 前回はなにをしましたか？',
              emoji: true,
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true,
              initial_value: isUpdate ? latestStandup.lastTimeTodo : undefined,
            },
          },
          {
            type: 'input',
            block_id: 'standup_today_todo',
            label: {
              type: 'plain_text',
              text: ':books: 今日はなにをしますか？',
              emoji: true,
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true,
              initial_value: isUpdate ? latestStandup.todayTodo : undefined,
            },
          },
          {
            type: 'input',
            block_id: 'standup_trouble',
            label: {
              type: 'plain_text',
              text: ':tractor: 困りごと、悩みごとはありますか？',
              emoji: true,
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true,
              initial_value: isUpdate ? latestStandup.trouble : undefined,
            },
            optional: true,
          },
          {
            type: 'input',
            block_id: 'standup_good_point',
            label: {
              type: 'plain_text',
              text: ':bulb: 最近のよかったことを教えてほしいです',
              emoji: true,
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true,
              initial_value: isUpdate ? latestStandup.goodPoint : undefined,
            },
            optional: true,
          },
          {
            type: 'input',
            block_id: 'standup_work_place',
            label: {
              type: 'plain_text',
              text: ':female-technologist: 今日の作業場所は？',
              emoji: true,
            },
            element: {
              type: 'static_select',
              action_id: 'select',
              placeholder: {
                type: 'plain_text',
                text: 'Select an item',
                emoji: true,
              },
              initial_option:
                isUpdate && latestStandup.workPlace !== ''
                  ? {
                      text: {
                        type: 'plain_text',
                        text: latestStandup.workPlace,
                        emoji: true,
                      },
                      value: latestStandup.workPlace,
                    }
                  : undefined,
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: 'リモートワーク',
                    emoji: true,
                  },
                  value: 'リモートワーク',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'オフィス',
                    emoji: true,
                  },
                  value: 'オフィス',
                },
              ],
            },
            optional: true,
          },
          {
            type: 'input',
            block_id: 'standup_information',
            label: {
              type: 'plain_text',
              text: ':memo: 連絡事項あれば',
              emoji: true,
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true,
              initial_value: isUpdate ? latestStandup.information : undefined,
            },
            optional: true,
          },
        ],
      },
    });
  } catch (error) {
    await app.client.chat
      .postEphemeral({
        token: context.botToken,
        user: args.userId,
        channel: args.userId,
        text: `Sorry, an error has occurred. ${error.data.error}`,
      })
      .catch((err) => {
        console.error(err);
      });
    console.error(error);
  }
};

type ShowSettingModalArguments = {
  triggerId: string;
  teamId: string;
  userId: string;
  say: SayFn;
};

export const showSettingModal = async (
  args: ShowSettingModalArguments,
  context
) => {
  const userInfo = (await app.client.users.info({
    token: context.botToken,
    user: args.userId,
  })) as UserInfoResult;

  if (!userInfo.user.is_admin) {
    args.say(`<@${args.userId}> Sorry. This command is for admin only.`);
    return;
  }

  const setting = await Setting.read(args.teamId);
  const broadcastChannel =
    setting && setting.broadcastChannel ? setting.broadcastChannel : undefined;
  const reminderText =
    setting && setting.reminderText
      ? setting.reminderText
      : '/remind #channel @here It is time for daily stand-up(/standup) every Weekday at 10:00';

  try {
    await app.client.views.open({
      token: context.botToken,
      trigger_id: args.triggerId,
      view: {
        type: 'modal',
        callback_id: 'standup_setting',
        title: {
          type: 'plain_text',
          text: 'Standup App Settings',
          emoji: true,
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
          emoji: true,
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true,
        },
        blocks: [
          {
            type: 'input',
            block_id: 'setting_broadcast_channel_input',
            element: {
              type: 'channels_select',
              action_id: 'channel',
              placeholder: {
                type: 'plain_text',
                text: 'Select a channel',
                emoji: true,
              },
              initial_channel: broadcastChannel,
            },
            label: {
              type: 'plain_text',
              text: 'Broadcast Channel',
              emoji: true,
            },
          },
          {
            type: 'input',
            block_id: 'setting_invite_input',
            element: {
              type: 'plain_text_input',
              action_id: 'invite_input',
              initial_value: '/invite @standup',
            },
            label: {
              type: 'plain_text',
              text: 'Invite bot',
              emoji: true,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: 'Please input this command in your broadcast channel.',
              },
            ],
          },
          {
            type: 'input',
            block_id: 'setting_reminder_input',
            element: {
              type: 'plain_text_input',
              action_id: 'reminder_input',
              initial_value: reminderText,
            },
            label: {
              type: 'plain_text',
              text: 'Reminder',
              emoji: true,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text:
                  'Please edit the above reminder settings and post to your slack team.\nRefer to the following for how to write a reminder.\nhttps://slack.com/help/articles/208423427-Set-a-reminder',
              },
            ],
          },
        ],
      },
    });
  } catch (error) {
    await app.client.chat
      .postEphemeral({
        token: context.botToken,
        user: args.userId,
        channel: args.userId,
        text: `Sorry, an error has occurred. ${error.data.error}`,
      })
      .catch((err) => {
        console.error(err);
      });
    console.error(error);
  }
};
