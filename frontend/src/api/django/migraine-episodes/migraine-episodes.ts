// @ts-nocheck
import type {
  MigraineEpisodeDetail,
  MigraineEpisodeHeatmap,
  MigraineEpisodeWrite,
  MigraineEpisodeWriteRequest,
  MigraineEpisodesHeatmapListParams,
  MigraineEpisodesListParams,
  PaginatedMigraineEpisodeListList,
} from "../djangoAPI.schemas";

import { customAxiosInstance } from "../../axios";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const migraineEpisodesList = (
  params?: MigraineEpisodesListParams,
  options?: SecondParameter<
    typeof customAxiosInstance<PaginatedMigraineEpisodeListList>
  >,
) => {
  return customAxiosInstance<PaginatedMigraineEpisodeListList>(
    { url: `/migraine/episodes/`, method: "GET", params },
    options,
  );
};
export const migraineEpisodesCreate = (
  migraineEpisodeWriteRequest: MigraineEpisodeWriteRequest,
  options?: SecondParameter<typeof customAxiosInstance<MigraineEpisodeWrite>>,
) => {
  return customAxiosInstance<MigraineEpisodeWrite>(
    {
      url: `/migraine/episodes/`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: migraineEpisodeWriteRequest,
    },
    options,
  );
};
export const migraineEpisodesRetrieve = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<MigraineEpisodeDetail>>,
) => {
  return customAxiosInstance<MigraineEpisodeDetail>(
    { url: `/migraine/episodes/${id}/`, method: "GET" },
    options,
  );
};
export const migraineEpisodesUpdate = (
  id: number,
  migraineEpisodeWriteRequest: MigraineEpisodeWriteRequest,
  options?: SecondParameter<typeof customAxiosInstance<MigraineEpisodeWrite>>,
) => {
  return customAxiosInstance<MigraineEpisodeWrite>(
    {
      url: `/migraine/episodes/${id}/`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: migraineEpisodeWriteRequest,
    },
    options,
  );
};
export const migraineEpisodesDestroy = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<void>>,
) => {
  return customAxiosInstance<void>(
    { url: `/migraine/episodes/${id}/`, method: "DELETE" },
    options,
  );
};
export const migraineEpisodesHeatmapList = (
  params?: MigraineEpisodesHeatmapListParams,
  options?: SecondParameter<
    typeof customAxiosInstance<MigraineEpisodeHeatmap[]>
  >,
) => {
  return customAxiosInstance<MigraineEpisodeHeatmap[]>(
    { url: `/migraine/episodes/heatmap/`, method: "GET", params },
    options,
  );
};
export type MigraineEpisodesListResult = NonNullable<
  Awaited<ReturnType<typeof migraineEpisodesList>>
>;
export type MigraineEpisodesCreateResult = NonNullable<
  Awaited<ReturnType<typeof migraineEpisodesCreate>>
>;
export type MigraineEpisodesRetrieveResult = NonNullable<
  Awaited<ReturnType<typeof migraineEpisodesRetrieve>>
>;
export type MigraineEpisodesUpdateResult = NonNullable<
  Awaited<ReturnType<typeof migraineEpisodesUpdate>>
>;
export type MigraineEpisodesDestroyResult = NonNullable<
  Awaited<ReturnType<typeof migraineEpisodesDestroy>>
>;
export type MigraineEpisodesHeatmapListResult = NonNullable<
  Awaited<ReturnType<typeof migraineEpisodesHeatmapList>>
>;
