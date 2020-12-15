import app from '~/slackapp/app';
import { showStandupModal, showSettingModal } from '~/slackapp/common/modal';
import {
  sendStandupRequestMessage,
  sendListWorkPlaceMessage
} from '~/slackapp/common/message';

app.command('/standup', async ({ ack, payload, context }) => {
  await ack();

  await showStandupModal(
    {
      userId: payload.user_id,
      teamId: payload.team_id,
      triggerId: payload.trigger_id
    },
    context
  );
});

app.command('/standup-setting', async ({ ack, payload, context, say }) => {
  await ack();

  await showSettingModal(
    {
      userId: payload.user_id,
      teamId: payload.team_id,
      triggerId: payload.trigger_id,
      say
    },
    context
  );
});

app.command('/standup-request', async ({ ack, payload, context }) => {
  await ack();

  await sendStandupRequestMessage(
    {
      channelId: payload.channel_id,
      userId: payload.user_id
    },
    context
  );
});

app.command('/standup-list-work-place', async ({ ack, payload, context }) => {
  await ack();

  await sendListWorkPlaceMessage(
    {
      channelId: payload.channel_id,
      userId: payload.user_id,
      teamId: payload.team_id
    },
    context
  );
});

export default app;
