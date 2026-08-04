export interface AnimeTrailer {
  id: string;
  site: string; // "youtube" | "dailymotion"
  thumbnail?: string | null;
}

export interface NextAiringEpisode {
  airingAt: number; // unix seconds
  episode: number;
  timeUntilAiring: number; // seconds
}

export interface AnimeEntry {
  id: number;
  title: string;
  coverImage: string;
  bannerImage?: string | null;
  trailer?: AnimeTrailer | null;
  nextAiringEpisode?: NextAiringEpisode | null;
  score: number | null; // normalized to out-of-10
  popularity?: number | null;
  favourites?: number | null;
  episodes?: number | null;
  status?: string;
  synopsis?: string | null;
  year?: number | null;
  genres?: string[];
  format?: string | null;
}

export type AnimeSectionKey = "top" | "airing" | "upcoming" | "popular";

export interface ScoreDistributionPoint {
  score: number;
  amount: number;
}

export interface AnimeCharacter {
  id: number;
  name: string;
  image: string;
  role: string;
  voiceActor?: { name: string; image?: string | null } | null;
}

export interface ExternalLink {
  site: string;
  url: string;
  icon?: string | null;
  color?: string | null;
}

export interface AnimeRecommendation {
  id: number;
  title: string;
  coverImage: string;
}

export interface AnimeDetails {
  scoreDistribution: ScoreDistributionPoint[];
  characters: AnimeCharacter[];
  externalLinks: ExternalLink[];
  recommendations: AnimeRecommendation[];
}