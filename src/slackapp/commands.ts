import app from '~/slackapp/app';

app.command('/standup', async ({ command, ack, say }) => {
  ack();
  say(`${command.text}`);
});

export default app;
