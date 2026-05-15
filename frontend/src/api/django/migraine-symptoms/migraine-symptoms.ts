// @ts-nocheck
import type {
  MigraineSymptomsListParams,
  Symptom,
  SymptomRequest,
} from "../djangoAPI.schemas";

import { customAxiosInstance } from "../../axios";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const migraineSymptomsList = (
  params?: MigraineSymptomsListParams,
  options?: SecondParameter<typeof customAxiosInstance<Symptom[]>>,
) => {
  return customAxiosInstance<Symptom[]>(
    { url: `/migraine/symptoms/`, method: "GET", params },
    options,
  );
};
export const migraineSymptomsCreate = (
  symptomRequest: SymptomRequest,
  options?: SecondParameter<typeof customAxiosInstance<Symptom>>,
) => {
  return customAxiosInstance<Symptom>(
    {
      url: `/migraine/symptoms/`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: symptomRequest,
    },
    options,
  );
};
export const migraineSymptomsRetrieve = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<Symptom>>,
) => {
  return customAxiosInstance<Symptom>(
    { url: `/migraine/symptoms/${id}/`, method: "GET" },
    options,
  );
};
export const migraineSymptomsUpdate = (
  id: number,
  symptomRequest: SymptomRequest,
  options?: SecondParameter<typeof customAxiosInstance<Symptom>>,
) => {
  return customAxiosInstance<Symptom>(
    {
      url: `/migraine/symptoms/${id}/`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: symptomRequest,
    },
    options,
  );
};
export const migraineSymptomsDestroy = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<void>>,
) => {
  return customAxiosInstance<void>(
    { url: `/migraine/symptoms/${id}/`, method: "DELETE" },
    options,
  );
};
export type MigraineSymptomsListResult = NonNullable<
  Awaited<ReturnType<typeof migraineSymptomsList>>
>;
export type MigraineSymptomsCreateResult = NonNullable<
  Awaited<ReturnType<typeof migraineSymptomsCreate>>
>;
export type MigraineSymptomsRetrieveResult = NonNullable<
  Awaited<ReturnType<typeof migraineSymptomsRetrieve>>
>;
export type MigraineSymptomsUpdateResult = NonNullable<
  Awaited<ReturnType<typeof migraineSymptomsUpdate>>
>;
export type MigraineSymptomsDestroyResult = NonNullable<
  Awaited<ReturnType<typeof migraineSymptomsDestroy>>
>;
