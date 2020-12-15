import dayjs from 'dayjs';
import app from '~/slackapp/app';
import Setting from '~/models/setting';
import Standup from '~/models/standup';
import Workspace from '~/models/workspace';
import { UserProfileResult, ChatPostMessageResult } from '~/types';

app.view('standup', async ({ ack, body, view, context }) => {
  await ack();

  const teamId = view.team_id;
  const workspace = await Workspace.read(teamId);
  const tzOffset = workspace.tzOffset || 0;
  const postDate = dayjs()
    .add(tzOffset, 'second')
    .startOf('day')
    .toJSON();

  const values = view['state']['values'];
  const status = values['standup_status']['select'].selected_option.value;
  const lastTimeTodo = values['standup_last_time_todo']['input'].value;
  const todayTodo = values['standup_today_todo']['input'].value;
  const trouble = values['standup_trouble']['input'].value;
  const goodPoint = values['standup_good_point']['input'].value;
  const workPlace =
    values['standup_work_place']['select'].selected_option?.value;
  const information = values['standup_information']['input'].value;
  const userId = body.user.id;
  const username = body.user.name;
  const isUpdate = view.submit!.text === 'Update';

  const setting = await Setting.read(teamId);
  if (!setting) {
    try {
      await app.client.chat.postEphemeral({
        token: context.botToken,
        user: userId,
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

  const headBlockTexts = ['*今日の気分はどうですか？*', `${status}\n`];
  const bodyBlockTexts = [
    '*前回はなにをしましたか？*',
    `${lastTimeTodo}\n`,
    '*今日はなにをしますか？*',
    `${todayTodo}\n`
  ];
  if (trouble) {
    bodyBlockTexts.push('*困りごと、悩みごとはありますか？*');
    bodyBlockTexts.push(`${trouble}\n`);
  }
  if (goodPoint) {
    bodyBlockTexts.push('*最近のよかったことを教えてほしいです*');
    bodyBlockTexts.push(goodPoint);
  }
  if (workPlace) {
    bodyBlockTexts.push('*今日の作業場所は？*');
    bodyBlockTexts.push(`${workPlace}\n`);
  }
  if (information) {
    bodyBlockTexts.push('*連絡事項あれば*');
    bodyBlockTexts.push(`${information}\n`);
  }

  let messageArguments = {
    token: context.botToken,
    channel: setting.broadcastChannel,
    text: '',
    blocks: [
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'image',
            image_url: userProfile.profile.image_192,
            alt_text: username
          },
          {
            type: 'mrkdwn',
            text: `${username}'s daily standup`
          }
        ]
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: headBlockTexts.join('\n')
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: bodyBlockTexts.join('\n')
        }
      }
    ]
  };

  try {
    let result;
    if (isUpdate) {
      const latestStandup = await Standup.read(teamId, userId);
      const updateMessageArguments = {
        ...messageArguments,
        ...{ ts: latestStandup.ts }
      };

      result = (await app.client.chat.update(
        updateMessageArguments
      )) as ChatPostMessageResult;
    } else {
      result = (await app.client.chat.postMessage(
        messageArguments
      )) as ChatPostMessageResult;
    }

    const { ts } = result;
    // TODO: stock standupInfo
    const standupInfo = {
      postDate,
      status,
      lastTimeTodo,
      todayTodo,
      trouble,
      goodPoint,
      workPlace,
      information,
      ts
    };
    await Standup.add({
      teamId,
      userId,
      standupInfo
    });
  } catch (error) {
    console.error(error);
  }
});

app.view('standup_setting', async ({ ack, body, view, context }) => {
  await ack();

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
    await app.client.chat.postMessage({
      token: context.botToken,
      channel: user,
      text: msg
    });
  } catch (error) {
    console.error(error);
  }
});

export default app;
