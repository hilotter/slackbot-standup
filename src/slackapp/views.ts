import dayjs from 'dayjs';
import app from '~/slackapp/app';
import { addTimezoneContext } from '~/slackapp/context';
import Setting from '~/models/setting';
import Standup from '~/models/standup';
import { UserProfileResult, ChatPostMessageResult } from '~/types';

app.view(
  'standup',
  addTimezoneContext,
  async ({ ack, body, view, context }) => {
    ack();

    const postDate = dayjs()
      .add(context.tz_offset, 'second')
      .startOf('day')
      .toJSON();

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

    const blockTexts = [
      '*:sunrise: 今日の気分はどうですか？*',
      `${status}\n`,
      '*:bee: 前回はなにをしましたか？*',
      `${lastTimeTodo}\n`,
      '*:books: 今日はなにをしますか？*',
      `${todayTodo}\n`
    ];
    if (trouble) {
      blockTexts.push('*:tractor: 困りごと、悩みごとはありますか？*');
      blockTexts.push(`${trouble}\n`);
    }
    if (goodPoint) {
      blockTexts.push('*:bulb: 最近のよかったことを教えてほしいです*');
      blockTexts.push(goodPoint);
    }

    let messageArguments = {
      token: context.botToken,
      channel: setting.broadcastChannel,
      text: '',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${username}'s daily standup`
          },
          accessory: {
            type: 'image',
            image_url: userProfile.profile.image_192,
            alt_text: username
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
  }
);

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
