export class SchoolInviteLinkResponse {
  constructor(
    public readonly token: string,
    public readonly url: string,
    /** TEMPORARY: short code for manual join; remove with temp flow. */
    public readonly tempJoinCode?: string,
  ) {}

  static from(token: string, url: string, tempJoinCode?: string): SchoolInviteLinkResponse {
    return new SchoolInviteLinkResponse(token, url, tempJoinCode);
  }
}
