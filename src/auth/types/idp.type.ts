export type ClientAccessTokenRequest = {
  grant_type: 'client_credentials';
  client_id: string;
  client_secret: string;
  scope: string;
};

export type ClientAccessTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

export type IdpUserInfoRes = {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  profile?: string;
  student_id?: string;
};

export type IdTokenPayload = {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  profile?: string;
  student_id?: string;
  iss: string;
};

export type AuthorizationCodeResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
};
