export class SchoolMemberValueObject {
  constructor(
    public readonly userId: string,
    public readonly joinedAt: Date,
  ) {}

  static create(data: { userId: string; joinedAt?: Date }): SchoolMemberValueObject {
    return new SchoolMemberValueObject(
      data.userId,
      data.joinedAt || new Date(),
    );
  }

  toDocument(): { userId: string; joinedAt: Date } {
    return {
      userId: this.userId,
      joinedAt: this.joinedAt,
    };
  }
}
