/**
 * HenrikDev VALORANT API — データ取得ヘルパー
 *
 * 使用エンドポイント:
 *   GET /valorant/v2/mmr/{region}/{platform}/{name}/{tag}   → ランク・RR
 *   GET /valorant/v4/matches/{region}/{platform}/{name}/{tag}?size=N → 直近N戦
 */

import type {
  getCurrentRankResponse,
  getRecentMatchesResponse,
  ValorantPlatform,
  ValorantRegion,
} from "../../types/types";
import { t, type SupportedLocale } from "./i18n";

const HENRIKDEV_API_BASE_URL: string = "https://api.henrikdev.xyz";
const MATCH_SIZE: number = 10;
const ERROR_MESSAGE_LENGTH: number = 300;

export default class OverlayData {
  token: string;
  constructor(token: string) {
    this.token = token;
  }

  private async fetchFromHenrikApi<T>(
    path: string,
    lang?: SupportedLocale,
  ): Promise<T> {
    const res = await fetch(`${HENRIKDEV_API_BASE_URL}${path}`, {
      headers: { Authorization: this.token },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(
        t(
          "message.server.error.apiFailed",
          { status: res.status, message: body.slice(0, ERROR_MESSAGE_LENGTH) },
          lang,
        ),
      );
    }
    return res.json();
  }

  private toRankTranslationKey(tierName: string): string {
    return tierName.trim().toUpperCase().replace(/\s+/g, "_");
  }

  public async fetchOverlayData(
    region: ValorantRegion | string,
    name: string,
    tag: string,
    platform: ValorantPlatform | string,
    lang?: SupportedLocale,
  ) {
    const [rank, matches] = await Promise.all([
      this.getCurrentRank(region, name, tag, platform, lang),
      this.getRecentMatches(region, name, tag, platform, lang),
    ]);

    if (!rank || !matches) {
      throw new Error(t("message.server.error.fetch", {}, lang));
    }

    return { rank, matches };
  }

  /**
   *  Get current rank data
   * @param region
   * @param name
   * @param tag
   * @param platform
   * @param lang
   * @returns getCurrentRankResponse
   */
  public async getCurrentRank(
    region: ValorantRegion | string,
    name: string,
    tag: string,
    platform: ValorantPlatform | string,
    lang?: SupportedLocale,
  ) {
    const path = `/valorant/v3/mmr/${region}/${platform}/${name}/${tag}`;
    const parsedData = await this.fetchFromHenrikApi<getCurrentRankResponse>(
      path,
      lang,
    );
    if (!parsedData.data) {
      throw new Error(
        t(
          "message.server.error.mmrNotFound",
          {
            status: parsedData.status,
            message: parsedData.errors[0]?.message || "Unknown error",
          },
          lang,
        ),
      );
    }
    const currentInfo = parsedData.data.current;

    const imageUrl = await this.getRankImageUrl(
      currentInfo.tier.name.toUpperCase(),
    );

    currentInfo.tier.name = t(
      `rank.tier.${this.toRankTranslationKey(currentInfo.tier.name)}`,
      {},
      lang,
    );

    return {
      ...currentInfo,
      imageUrl,
    };
  }

  /**
   * Get recent matches data (competitive mode only)
   * @param region
   * @param name
   * @param tag
   * @param platform
   * @param lang
   * @returns getRecentMatchesResponse
   */
  public async getRecentMatches(
    region: ValorantRegion | string,
    name: string,
    tag: string,
    platform: ValorantPlatform | string,
    lang?: SupportedLocale,
  ) {
    const path = `/valorant/v4/matches/${region}/${platform}/${name}/${tag}?mode=competitive&size=${MATCH_SIZE}`;
    const parsedData = await this.fetchFromHenrikApi<getRecentMatchesResponse>(
      path,
      lang,
    );
    if (parsedData.data.length === 0) {
      throw new Error(
        t(
          "message.server.error.matchNotFound",
          {
            status: parsedData.status,
            message: parsedData.errors[0]?.message || "Unknown error",
          },
          lang,
        ),
      );
    }

    const myMatchesInfo = parsedData.data.map((match) => {
      const me = match.players?.find(
        (player) => player.name === name && player.tag === tag,
      );
      if (!me) {
        throw new Error(
          t(
            "message.server.error.playerNotFound",
            { player: `${name}#${tag}` },
            lang,
          ),
        );
      }

      const myTeam = me.team_id;
      const myTeamInfo = match.teams?.find((team) => team.team_id === myTeam);
      const kda = (me.stats.assists + me.stats.kills) / me.stats.deaths;

      return {
        date: match.metadata?.started_at
          ? new Date(match.metadata.started_at).toDateString()
          : "Unknown Date",
        isWin: myTeamInfo?.won,
        kda: kda.toFixed(2),
        ...me,
      };
    });

    return myMatchesInfo;
  }

  private async getRankImageUrl(rankName: string): Promise<string> {
    const IMAGE_API_BASE_URL = "https://valorant-api.com";
    const DEFAULT_RANK_IMAGE_URL =
      "https://media.valorant-api.com/competitivetiers/564d8e28-c226-3180-6285-e48a390db8b1/0/smallicon.png";
    const rankImageCache = new Map<string, string>();
    const path = "/v1/competitivetiers";
    try {
      const cached = rankImageCache.get(rankName);
      if (cached) return cached;

      const response = await fetch(`${IMAGE_API_BASE_URL}${path}`);
      if (!response.ok) return DEFAULT_RANK_IMAGE_URL;
      const responseData = (await response.json()) as any;
      const currentEpisodeIndex = responseData.data.length - 1;
      const tier = responseData.data[currentEpisodeIndex].tiers.find(
        (item: any) => item.tierName === rankName,
      );

      const imageUrl = tier ? tier.smallIcon : DEFAULT_RANK_IMAGE_URL;
      rankImageCache.set(rankName, imageUrl);
      return imageUrl;
    } catch (err) {
      return DEFAULT_RANK_IMAGE_URL;
    }
  }
}
