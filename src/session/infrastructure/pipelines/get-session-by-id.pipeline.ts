import { PipelineStage, Types } from 'mongoose';

export const buildGetSessionByIdPipeline = (sessionId: string): PipelineStage[] => [
    { $match: { _id: new Types.ObjectId(sessionId) } },
    {
      $lookup: {
        from: 'memberships',
        let: { athleteMembershipIds: '$athletes.userId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  '$_id',
                  {
                    $filter: {
                      input: {
                        $map: {
                          input: { $ifNull: ['$$athleteMembershipIds', []] },
                          as: 'membershipId',
                          in: {
                            $convert: {
                              input: '$$membershipId',
                              to: 'objectId',
                              onError: null,
                              onNull: null,
                            },
                          },
                        },
                      },
                      as: 'membershipObjectId',
                      cond: { $ne: ['$$membershipObjectId', null] },
                    },
                  },
                ],
              },
            },
          },
          {
            $lookup: {
              from: 'users',
              let: { membershipUserId: '$userId' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: [
                        '$_id',
                        {
                          $convert: {
                            input: '$$membershipUserId',
                            to: 'objectId',
                            onError: null,
                            onNull: null,
                          },
                        },
                      ],
                    },
                  },
                },
                { $project: { profilePictureUrl: 1 } },
              ],
              as: 'user',
            },
          },
          {
            $project: {
              _id: 1,
              profilePictureUrl: { $first: '$user.profilePictureUrl' },
            },
          },
        ],
        as: 'athleteProfiles',
      },
    },
    {
      $addFields: {
        athletes: {
          $map: {
            input: { $ifNull: ['$athletes', []] },
            as: 'athlete',
            in: {
              $let: {
                vars: {
                  profile: {
                    $first: {
                      $filter: {
                        input: '$athleteProfiles',
                        as: 'profile',
                        cond: {
                          $let: {
                            vars: {
                              membershipObjectId: {
                                $convert: {
                                  input: '$$athlete.userId',
                                  to: 'objectId',
                                  onError: null,
                                  onNull: null,
                                },
                              },
                            },
                            in: {
                              $and: [
                                { $ne: ['$$membershipObjectId', null] },
                                { $eq: ['$$profile._id', '$$membershipObjectId'] },
                              ],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                in: {
                  $mergeObjects: [
                    '$$athlete',
                    {
                      profilePictureUrl: {
                        $cond: [
                          { $ifNull: ['$$profile', false] },
                          '$$profile.profilePictureUrl',
                          '$$athlete.profilePictureUrl',
                        ],
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },
    { $project: { athleteProfiles: 0 } },
  ];
