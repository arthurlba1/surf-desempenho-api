export class SchoolInviteLinkResponse {
  constructor(
    public readonly token: string,
    public readonly url: string,
  ) {}

  static from(token: string, url: string): SchoolInviteLinkResponse {
    return new SchoolInviteLinkResponse(token, url);
  }
}
