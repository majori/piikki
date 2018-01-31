// Extend Express own request object with additional info
declare namespace Express {
  export interface Request {
    insights: {
      startTime: number;
    };

    piikki: {
      token: DatabaseToken;
      groupAccess: {
        all: boolean;
        group: {
          name: string | null;
        },
      },
      admin: {
        isAdmin: boolean;
      },
    };
  }
}
