import app from '~/slackapp/app';
import Setting from '~/models/setting';
import { UserProfileResult } from '~/types';

app.view('standup', async ({ ack, body, view, context }) => {
  ack();

  const status =
    view['state']['values']['standup_status']['select'].selected_option.value;
  const lastTimeTodo =
    view['state']['values']['standup_last_time_todo']['input'].value;
  const todayTodo =
    view['state']['values']['standup_today_todo']['input'].value;
  const trouble = view['state']['values']['standup_trouble']['input'].value;
  const goodPoint =
    view['state']['values']['standup_good_point']['input'].value;
  const teamId = view.team_id;
  const userId = body.user.id;
  const username = body.user.name;

  // TODO: save db

  const setting = await Setting.read(teamId);
  if (!setting) {
    try {
      app.client.chat.postMessage({
        token: context.botToken,
        channel: userId,
        text: 'setting not found. please input "/standup-setting" in advance'
      });
    } catch (error) {
      console.error(error);
    }
    return;
  }

  const userProfile = (await app.client.users.profile.get({
    token: context.botToken,
    user: userId
  })) as UserProfileResult;

  const blockTexts = [
    '*:sunrise: 今日の気分はどうですか？*',
    '\n',
    status,
    '\n',
    '*:bee: 前回はなにをしましたか？*',
    '\n',
    lastTimeTodo,
    '\n',
    '*:books: 今日はなにをしますか？*',
    '\n',
    todayTodo
  ];
  if (trouble) {
    blockTexts.push('\n');
    blockTexts.push('*:tractor: 困りごと、悩みごとはありますか？*');
    blockTexts.push('\n');
    blockTexts.push(trouble);
  }
  if (goodPoint) {
    blockTexts.push('\n');
    blockTexts.push('*:bulb: 最近のよかったことを教えてほしいです*');
    blockTexts.push('\n');
    blockTexts.push(goodPoint);
  }

  try {
    app.client.chat.postMessage({
      token: context.botToken,
      channel: setting.broadcastChannel,
      text: '',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${username}'s daily standup`
          }
        },
        {
          type: 'divider'
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: blockTexts.join('\n')
          },
          accessory: {
            type: 'image',
            image_url: userProfile.profile.image_192,
            alt_text: username
          }
        }
      ]
    });
  } catch (error) {
    console.error(error);
  }
});

app.view('standup_setting', async ({ ack, body, view, context }) => {
  ack();

  const teamId: string = view.team_id;
  const broadcastChannel: string =
    view['state']['values']['setting_broadcast_channel_input']['channel']
      .selected_channel;
  const reminderText: string =
    view['state']['values']['setting_reminder_input']['reminder_input'].value;

  const settingInfo = {
    broadcastChannel,
    reminderText
  };
  const user = body.user.id;

  const results = await Setting.add({ teamId, settingInfo });

  let msg = '';
  if (results) {
    msg = 'Setting was updated';
  } else {
    msg = 'There was an error with your submission';
  }

  try {
    app.client.chat.postMessage({
      token: context.botToken,
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }
});

export default app;