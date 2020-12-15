import { MessageAction, BlockAction } from '@slack/bolt';
import app from '~/slackapp/app';
import { showStandupModal } from '~/slackapp/common/modal';

// from Interactive Components
app.action({ callback_id: 'input_standup' }, async ({ ack, body, context }) => {
  await ack();

  const action = body as MessageAction;
  await showStandupModal(
    {
      userId: action.user.id,
      teamId: action.team.id,
      triggerId: action.trigger_id
    },
    context
  );
});

// from command
app.action('show_standup_modal', async ({ ack, body, context }) => {
  await ack();

  const blockAction = body as BlockAction;
  await showStandupModal(
    {
      userId: blockAction.user.id,
      teamId: blockAction.team.id,
      triggerId: blockAction.trigger_id
    },
    context
  );
});

export default app;
