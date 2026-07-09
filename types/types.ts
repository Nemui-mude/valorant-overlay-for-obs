export type ValorantRegion = "eu" | "na" | "latam" | "br" | "ap" | "kr";
export type ValorantPlatform = "pc" | "console";

export type ApiResponse = {
  rank: {
    imageUrl: string;
    tier: {
      id: number;
      name: string;
    };
    rr: number;
    lastChange: number;
  };
  matches: {
    puuid: string;
    name: string;
    tag: string;
    team_id: string;
    agent: {
      id: string;
      name: string;
    };
    stats: {
      assists: number;
      kills: number;
      deaths: number;
    };
    date: string;
    isWin: boolean | undefined;
    kda: string;
  }[];
  status: number;
  agentVisible: boolean;
  ui: {
    recentMatchesTitle: string;
    winSuffix: string;
    loseSuffix: string;
  };
};

export type ErrorResponse = {
  message: string;
  code: number;
  details: string;
};

export type IndividualMatchData = {
  puuid: string;
  name: string;
  tag: string;
  team_id: string;
  agent: {
    id: string;
    name: string;
  };
  stats: {
    assists: number;
    kills: number;
    deaths: number;
  };
};

export interface getCurrentRankResponse {
  status: number;
  data: {
    current: {
      tier: {
        id: number;
        name: string;
      };
      rr: number;
      lastChange: number;
    };
  };
  errors: Array<ErrorResponse>;
}

export interface getRecentMatchesResponse {
  status: number;
  data: Array<{
    metadata: {
      map: {
        id: string;
        name: string;
      };
      started_at: string;
      is_completed: boolean;
      queue: {
        id: string;
        name: string;
        mode_type: string;
      };
    };
    players: Array<IndividualMatchData>;
    teams: Array<{
      team_id: string;
      won: boolean;
    }>;
  }>;
  errors: Array<ErrorResponse>;
}
