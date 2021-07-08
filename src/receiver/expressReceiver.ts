import { ExpressReceiver } from '@slack/bolt';

const expressReceiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET!,
});

export default expressReceiver;
