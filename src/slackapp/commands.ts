import app from '~/slackapp/app';
import { UserInfoResult } from '~/types';
import Setting from '~/models/setting';

app.command('/standup', async ({ ack, payload, context }) => {
  ack();

  try {
    app.client.views.open({
      token: context.botToken,
      trigger_id: payload.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'standup',
        title: {
          type: 'plain_text',
          text: 'Daily Standup',
          emoji: true
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
          emoji: true
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: `:wave: Hello!\n\n`,
              emoji: true
            }
          },
          {
            type: 'divider'
          },
          {
            type: 'input',
            block_id: 'standup_status',
            label: {
              type: 'plain_text',
              text: ':sunrise: 今日の気分はどうですか？',
              emoji: true
            },
            element: {
              type: 'static_select',
              action_id: 'select',
              placeholder: {
                type: 'plain_text',
                text: 'Select an item',
                emoji: true
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: '最高',
                    emoji: true
                  },
                  value: '最高'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'いいかんじ',
                    emoji: true
                  },
                  value: 'いいかんじ'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'ちょっとわるい',
                    emoji: true
                  },
                  value: 'ちょっとわるい'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'きびしい',
                    emoji: true
                  },
                  value: 'きびしい'
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'もうダメ、だれか助けて',
                    emoji: true
                  },
                  value: 'もうダメ、だれか助けて'
                }
              ]
            }
          },
          {
            type: 'input',
            block_id: 'standup_last_time_todo',
            label: {
              type: 'plain_text',
              text: ':bee: 前回はなにをしましたか？',
              emoji: true
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true
            }
          },
          {
            type: 'input',
            block_id: 'standup_today_todo',
            label: {
              type: 'plain_text',
              text: ':books: 今日はなにをしますか？',
              emoji: true
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true
            }
          },
          {
            type: 'input',
            block_id: 'standup_trouble',
            label: {
              type: 'plain_text',
              text: ':tractor: 困りごと、悩みごとはありますか？',
              emoji: true
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true
            },
            optional: true
          },
          {
            type: 'input',
            block_id: 'standup_good_point',
            label: {
              type: 'plain_text',
              text: ':bulb: 最近のよかったことを教えてほしいです',
              emoji: true
            },
            element: {
              type: 'plain_text_input',
              action_id: 'input',
              multiline: true
            },
            optional: true
          }
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

app.command('/standup-setting', async ({ ack, payload, context, say }) => {
  ack();

  const userInfo = (await app.client.users.info({
    token: context.botToken,
    user: payload.user_id
  })) as UserInfoResult;

  if (!userInfo.user.is_admin) {
    say(`<@${payload.user_id}> Sorry. This command is for admin only.`);
    return;
  }

  const setting = await Setting.read(payload.team_id);
  const broadcastChannel = setting.broadcastChannel
    ? setting.broadcastChannel
    : undefined;
  const reminderText = setting.reminderText
    ? setting.reminderText
    : '/remind #channel @here It is time for daily stand-up(/standup) every Weekday at 10:00';

  try {
    app.client.views.open({
      token: context.botToken,
      trigger_id: payload.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'standup_setting',
        title: {
          type: 'plain_text',
          text: 'Standup App Settings',
          emoji: true
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
          emoji: true
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
          emoji: true
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
                emoji: true
              },
              initial_channel: broadcastChannel
            },
            label: {
              type: 'plain_text',
              text: 'Broadcast Channel',
              emoji: true
            }
          },
          {
            type: 'input',
            block_id: 'setting_reminder_input',
            element: {
              type: 'plain_text_input',
              action_id: 'reminder_input',
              initial_value: reminderText
            },
            label: {
              type: 'plain_text',
              text: 'Reminder',
              emoji: true
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text:
                  'Please edit the above reminder settings and post to your slack team.\nRefer to the following for how to write a reminder.\nhttps://slack.com/help/articles/208423427-Set-a-reminder'
              }
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error(error);
  }
});

export default app;
