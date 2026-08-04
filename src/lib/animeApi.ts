import type { AnimeDetails, AnimeEntry } from "@/types/anime";

const ENDPOINT = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  id
  title {
    romaji
    english
  }
  coverImage {
    large
    extraLarge
  }
  bannerImage
  trailer {
    id
    site
    thumbnail
  }
  nextAiringEpisode {
    airingAt
    episode
    timeUntilAiring
  }
  averageScore
  popularity
  favourites
  episodes
  status
  seasonYear
  genres
  format
  description(asHtml: false)
`;

interface RawMedia {
  id: number;
  title: { romaji: string; english: string | null };
  coverImage: { large: string; extraLarge: string | null };
  bannerImage: string | null;
  trailer: { id: string; site: string; thumbnail: string | null } | null;
  nextAiringEpisode: { airingAt: number; episode: number; timeUntilAiring: number } | null;
  averageScore: number | null;
  popularity: number | null;
  favourites: number | null;
  episodes: number | null;
  status: string | null;
  seasonYear: number | null;
  genres: string[] | null;
  format: string | null;
  description: string | null;
}

const STATUS_LABEL: Record<string, string> = {
  FINISHED: "Finished",
  RELEASING: "Airing",
  NOT_YET_RELEASED: "Upcoming",
  CANCELLED: "Cancelled",
  HIATUS: "On hiatus",
};

function stripMarkup(text: string | null): string | null {
  if (!text) return null;
  return text
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .trim();
}

function normalize(m: RawMedia): AnimeEntry {
  return {
    id: m.id,
    title: m.title.english || m.title.romaji,
    coverImage: m.coverImage.extraLarge || m.coverImage.large,
    bannerImage: m.bannerImage,
    trailer:
      m.trailer && m.trailer.site === "youtube"
        ? { id: m.trailer.id, site: m.trailer.site, thumbnail: m.trailer.thumbnail }
        : null,
    nextAiringEpisode: m.nextAiringEpisode,
    score: m.averageScore != null ? Math.round(m.averageScore) / 10 : null,
    popularity: m.popularity,
    favourites: m.favourites,
    episodes: m.episodes,
    status: m.status ? STATUS_LABEL[m.status] ?? m.status : undefined,
    synopsis: stripMarkup(m.description),
    year: m.seasonYear,
    genres: m.genres ?? [],
    format: m.format ? m.format.replace(/_/g, " ") : null,
  };
}

async function postGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`AniList request failed: ${res.status}`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0]?.message ?? "AniList query error");
  }
  return json.data as T;
}

async function queryAniListList(
  query: string,
  variables: Record<string, unknown>
): Promise<RawMedia[]> {
  const data = await postGraphQL<{ Page: { media: RawMedia[] } }>(query, variables);
  return data.Page.media;
}

const LIST_QUERY = `
  query ($sort: [MediaSort], $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: $sort) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const LIST_QUERY_WITH_STATUS = `
  query ($sort: [MediaSort], $status: MediaStatus, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, sort: $sort, status: $status) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const SEARCH_QUERY = `
  query ($search: String, $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(type: ANIME, search: $search, sort: POPULARITY_DESC) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const BY_ID_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_FIELDS}
    }
  }
`;

const DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      stats {
        scoreDistribution {
          score
          amount
        }
      }
      characters(sort: [ROLE, RELEVANCE], perPage: 8) {
        edges {
          role
          node {
            id
            name {
              full
            }
            image {
              medium
            }
          }
          voiceActors(language: JAPANESE) {
            name {
              full
            }
            image {
              medium
            }
          }
        }
      }
      externalLinks {
        site
        url
        icon
        color
      }
      recommendations(sort: RATING_DESC, perPage: 8) {
        nodes {
          mediaRecommendation {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  }
`;

export async function fetchTopAnime(limit = 12): Promise<AnimeEntry[]> {
  const media = await queryAniListList(LIST_QUERY, {
    sort: "POPULARITY_DESC",
    perPage: limit,
  });
  return media.map(normalize);
}

export async function fetchAiringNow(limit = 12): Promise<AnimeEntry[]> {
  const media = await queryAniListList(LIST_QUERY_WITH_STATUS, {
    sort: "TRENDING_DESC",
    status: "RELEASING",
    perPage: limit,
  });
  return media.map(normalize);
}

export async function fetchUpcoming(limit = 12): Promise<AnimeEntry[]> {
  const media = await queryAniListList(LIST_QUERY_WITH_STATUS, {
    sort: "POPULARITY_DESC",
    status: "NOT_YET_RELEASED",
    perPage: limit,
  });
  return media.map(normalize);
}

export async function fetchMostPopular(limit = 12): Promise<AnimeEntry[]> {
  const media = await queryAniListList(LIST_QUERY, {
    sort: "FAVOURITES_DESC",
    perPage: limit,
  });
  return media.map(normalize);
}

export async function searchAnime(query: string, limit = 10): Promise<AnimeEntry[]> {
  if (!query.trim()) return [];
  const media = await queryAniListList(SEARCH_QUERY, { search: query, perPage: limit });
  return media.map(normalize);
}

export async function fetchAnimeById(id: number): Promise<AnimeEntry> {
  const data = await postGraphQL<{ Media: RawMedia }>(BY_ID_QUERY, { id });
  return normalize(data.Media);
}

interface RawDetail {
  stats: { scoreDistribution: { score: number; amount: number }[] | null } | null;
  characters: {
    edges: {
      role: string;
      node: { id: number; name: { full: string }; image: { medium: string } };
      voiceActors: { name: { full: string }; image: { medium: string | null } }[];
    }[];
  } | null;
  externalLinks: { site: string; url: string; icon: string | null; color: string | null }[] | null;
  recommendations: {
    nodes: {
      mediaRecommendation: {
        id: number;
        title: { romaji: string; english: string | null };
        coverImage: { large: string };
      } | null;
    }[];
  } | null;
}

export async function fetchAnimeDetails(id: number): Promise<AnimeDetails> {
  const data = await postGraphQL<{ Media: RawDetail }>(DETAIL_QUERY, { id });
  const media = data.Media;

  return {
    scoreDistribution: media.stats?.scoreDistribution ?? [],
    characters: (media.characters?.edges ?? []).map((e) => ({
      id: e.node.id,
      name: e.node.name.full,
      image: e.node.image.medium,
      role: e.role,
      voiceActor: e.voiceActors?.[0]
        ? { name: e.voiceActors[0].name.full, image: e.voiceActors[0].image.medium }
        : null,
    })),
    externalLinks: (media.externalLinks ?? []).map((l) => ({
      site: l.site,
      url: l.url,
      icon: l.icon,
      color: l.color,
    })),
    recommendations: (media.recommendations?.nodes ?? [])
      .map((n) => n.mediaRecommendation)
      .filter((m): m is NonNullable<typeof m> => m != null)
      .map((m) => ({
        id: m.id,
        title: m.title.english || m.title.romaji,
        coverImage: m.coverImage.large,
      })),
  };
}