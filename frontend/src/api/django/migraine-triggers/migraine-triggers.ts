// @ts-nocheck
import type {
  MigraineTriggersListParams,
  Trigger,
  TriggerRequest,
} from "../djangoAPI.schemas";

import { customAxiosInstance } from "../../axios";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const migraineTriggersList = (
  params?: MigraineTriggersListParams,
  options?: SecondParameter<typeof customAxiosInstance<Trigger[]>>,
) => {
  return customAxiosInstance<Trigger[]>(
    { url: `/migraine/triggers/`, method: "GET", params },
    options,
  );
};
export const migraineTriggersCreate = (
  triggerRequest: TriggerRequest,
  options?: SecondParameter<typeof customAxiosInstance<Trigger>>,
) => {
  return customAxiosInstance<Trigger>(
    {
      url: `/migraine/triggers/`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: triggerRequest,
    },
    options,
  );
};
export const migraineTriggersRetrieve = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<Trigger>>,
) => {
  return customAxiosInstance<Trigger>(
    { url: `/migraine/triggers/${id}/`, method: "GET" },
    options,
  );
};
export const migraineTriggersUpdate = (
  id: number,
  triggerRequest: TriggerRequest,
  options?: SecondParameter<typeof customAxiosInstance<Trigger>>,
) => {
  return customAxiosInstance<Trigger>(
    {
      url: `/migraine/triggers/${id}/`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: triggerRequest,
    },
    options,
  );
};
export const migraineTriggersDestroy = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<void>>,
) => {
  return customAxiosInstance<void>(
    { url: `/migraine/triggers/${id}/`, method: "DELETE" },
    options,
  );
};
export type MigraineTriggersListResult = NonNullable<
  Awaited<ReturnType<typeof migraineTriggersList>>
>;
export type MigraineTriggersCreateResult = NonNullable<
  Awaited<ReturnType<typeof migraineTriggersCreate>>
>;
export type MigraineTriggersRetrieveResult = NonNullable<
  Awaited<ReturnType<typeof migraineTriggersRetrieve>>
>;
export type MigraineTriggersUpdateResult = NonNullable<
  Awaited<ReturnType<typeof migraineTriggersUpdate>>
>;
export type MigraineTriggersDestroyResult = NonNullable<
  Awaited<ReturnType<typeof migraineTriggersDestroy>>
>;
