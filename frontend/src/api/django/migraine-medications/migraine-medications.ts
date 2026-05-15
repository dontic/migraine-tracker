// @ts-nocheck
import type {
  Medication,
  MedicationRequest,
  MigraineMedicationsListParams,
} from "../djangoAPI.schemas";

import { customAxiosInstance } from "../../axios";

type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const migraineMedicationsList = (
  params?: MigraineMedicationsListParams,
  options?: SecondParameter<typeof customAxiosInstance<Medication[]>>,
) => {
  return customAxiosInstance<Medication[]>(
    { url: `/migraine/medications/`, method: "GET", params },
    options,
  );
};
export const migraineMedicationsCreate = (
  medicationRequest: MedicationRequest,
  options?: SecondParameter<typeof customAxiosInstance<Medication>>,
) => {
  return customAxiosInstance<Medication>(
    {
      url: `/migraine/medications/`,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      data: medicationRequest,
    },
    options,
  );
};
export const migraineMedicationsRetrieve = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<Medication>>,
) => {
  return customAxiosInstance<Medication>(
    { url: `/migraine/medications/${id}/`, method: "GET" },
    options,
  );
};
export const migraineMedicationsUpdate = (
  id: number,
  medicationRequest: MedicationRequest,
  options?: SecondParameter<typeof customAxiosInstance<Medication>>,
) => {
  return customAxiosInstance<Medication>(
    {
      url: `/migraine/medications/${id}/`,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      data: medicationRequest,
    },
    options,
  );
};
export const migraineMedicationsDestroy = (
  id: number,
  options?: SecondParameter<typeof customAxiosInstance<void>>,
) => {
  return customAxiosInstance<void>(
    { url: `/migraine/medications/${id}/`, method: "DELETE" },
    options,
  );
};
export type MigraineMedicationsListResult = NonNullable<
  Awaited<ReturnType<typeof migraineMedicationsList>>
>;
export type MigraineMedicationsCreateResult = NonNullable<
  Awaited<ReturnType<typeof migraineMedicationsCreate>>
>;
export type MigraineMedicationsRetrieveResult = NonNullable<
  Awaited<ReturnType<typeof migraineMedicationsRetrieve>>
>;
export type MigraineMedicationsUpdateResult = NonNullable<
  Awaited<ReturnType<typeof migraineMedicationsUpdate>>
>;
export type MigraineMedicationsDestroyResult = NonNullable<
  Awaited<ReturnType<typeof migraineMedicationsDestroy>>
>;
