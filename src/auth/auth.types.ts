export interface IAuthRequest {
    client_id: string;
    client_secret: string;
    grant_type: string;
    code: string;
    redirect_uri: string;
}

export interface IAuthResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    refresh_token: string;
}