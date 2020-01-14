import { WebAPICallResult } from '@slack/web-api';

export interface BotInfoResult extends WebAPICallResult {
  user: {
    profile: {
      bot_id: string;
    };
  };
}

export interface OAuthV2AccessResult extends WebAPICallResult {
  ok: boolean;
  access_token: string;
  token_type: string;
  scope: string;
  bot_user_id: string;
  app_id: string;
  team: {
    name: string;
    id: string;
  };
  authed_user: {
    id: string;
    scope: string;
    access_token: string;
    token_type: string;
  };
}
