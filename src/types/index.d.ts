import { WebAPICallResult } from '@slack/web-api';

export interface UserProfileResult extends WebAPICallResult {
  profile: {
    image_72: string;
    image_192: string;
  };
}

export interface UserInfoResult extends WebAPICallResult {
  user: {
    is_admin: boolean;
    tz_offset: number;
  };
}

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

export interface ChatPostMessageResult extends WebAPICallResult {
  ts: string;
}
