// @ts-nocheck
export type BlankEnum = (typeof BlankEnum)[keyof typeof BlankEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const BlankEnum = {
  "": "",
} as const;

/**
 * * `none` - None — normal activity
 * `mild` - Mild — reduced efficiency
 * `moderate` - Moderate — significant impairment
 * `severe` - Severe — bed rest required
 */
export type DisabilityLevelEnum =
  (typeof DisabilityLevelEnum)[keyof typeof DisabilityLevelEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const DisabilityLevelEnum = {
  none: "none",
  mild: "mild",
  moderate: "moderate",
  severe: "severe",
} as const;

/**
 * * `0` - No relief
 * `1` - Partial relief
 * `2` - Full relief
 */
export type EffectivenessEnum =
  (typeof EffectivenessEnum)[keyof typeof EffectivenessEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const EffectivenessEnum = {
  NUMBER_0: 0,
  NUMBER_1: 1,
  NUMBER_2: 2,
} as const;

/**
 * * `left` - Left
 * `right` - Right
 * `both` - Both
 */
export type HeadacheSideEnum =
  (typeof HeadacheSideEnum)[keyof typeof HeadacheSideEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const HeadacheSideEnum = {
  left: "left",
  right: "right",
  both: "both",
} as const;

export interface LoginRequest {
  /** @minLength 1 */
  username: string;
  /** @minLength 1 */
  password: string;
}

export interface Medication {
  readonly id: number;
  /** @maxLength 100 */
  name: string;
  type?: TypeEnum;
  is_active?: boolean;
  readonly created_at: string;
}

export interface MedicationRequest {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  type?: TypeEnum;
  is_active?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeDetailHeadacheSide = {
  ...HeadacheSideEnum,
  ...BlankEnum,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeDetailDisabilityLevel = {
  ...DisabilityLevelEnum,
  ...BlankEnum,
} as const;
export interface MigraineEpisodeDetail {
  readonly id: number;
  started_at: string;
  /** @nullable */
  ended_at?: string | null;
  readonly duration_hours: number;
  migraine_type?: MigraineTypeEnum;
  /**
   * 0=none, 1=little, 2=discomfort, 3=can't work, 4=debilitating, 5=hospital
   * @minimum 0
   * @maximum 32767
   */
  pain_level?: number;
  headache_side?: (typeof MigraineEpisodeDetailHeadacheSide)[keyof typeof MigraineEpisodeDetailHeadacheSide];
  headache_regions?: string[];
  disability_level?: (typeof MigraineEpisodeDetailDisabilityLevel)[keyof typeof MigraineEpisodeDetailDisabilityLevel];
  has_aura?: boolean;
  aura_types?: string[];
  visual_aura_locations?: string[];
  /**
   * @minimum 0
   * @maximum 32767
   * @nullable
   */
  aura_duration_minutes?: number | null;
  /**
   * Hours of sleep the night before onset
   * @nullable
   * @pattern ^-?\d{0,3}(?:\.\d{0,1})?$
   */
  sleep_hours_before?: string | null;
  /**
   * 0=none … 5=extreme
   * @minimum 0
   * @maximum 32767
   * @nullable
   */
  stress_level?: number | null;
  /** @nullable */
  menstrual_related?: boolean | null;
  notes?: string;
  readonly triggers: readonly Trigger[];
  readonly symptoms: readonly Symptom[];
  readonly episode_medications: readonly MigraineEpisodeMedicationRead[];
  readonly created_at: string;
  readonly updated_at: string;
}

export interface MigraineEpisodeHeatmap {
  readonly id: number;
  readonly date: string;
  /** 0=none, 1=little, 2=discomfort, 3=can't work, 4=debilitating, 5=hospital */
  readonly pain_level: number;
}

export interface MigraineEpisodeList {
  readonly id: number;
  readonly started_at: string;
  /** @nullable */
  readonly ended_at: string | null;
  readonly duration_hours: number;
  readonly migraine_type: MigraineTypeEnum;
  /** 0=none, 1=little, 2=discomfort, 3=can't work, 4=debilitating, 5=hospital */
  readonly pain_level: number;
  readonly disability_level: DisabilityLevelEnum;
  readonly has_aura: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeMedicationReadEffectiveness = {
  ...EffectivenessEnum,
  ...NullEnum,
} as const;
/**
 * @minimum -32768
 * @maximum 32767
 * @nullable
 */
export type MigraineEpisodeMedicationReadEffectiveness =
  | (typeof MigraineEpisodeMedicationReadEffectiveness)[keyof typeof MigraineEpisodeMedicationReadEffectiveness]
  | null;

export interface MigraineEpisodeMedicationRead {
  readonly id: number;
  readonly medication: Medication;
  /**
   * Minutes from episode start when taken (negative = taken before onset)
   * @minimum -2147483648
   * @maximum 2147483647
   * @nullable
   */
  taken_offset_minutes?: number | null;
  /** @maxLength 50 */
  dose?: string;
  /**
   * @minimum -32768
   * @maximum 32767
   * @nullable
   */
  effectiveness?: MigraineEpisodeMedicationReadEffectiveness;
  readonly effectiveness_display: string;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeMedicationWriteEffectiveness = {
  ...EffectivenessEnum,
  ...NullEnum,
} as const;
/**
 * @minimum -32768
 * @maximum 32767
 * @nullable
 */
export type MigraineEpisodeMedicationWriteEffectiveness =
  | (typeof MigraineEpisodeMedicationWriteEffectiveness)[keyof typeof MigraineEpisodeMedicationWriteEffectiveness]
  | null;

export interface MigraineEpisodeMedicationWrite {
  medication: number;
  /**
   * Minutes from episode start when taken (negative = taken before onset)
   * @minimum -2147483648
   * @maximum 2147483647
   * @nullable
   */
  taken_offset_minutes?: number | null;
  /** @maxLength 50 */
  dose?: string;
  /**
   * @minimum -32768
   * @maximum 32767
   * @nullable
   */
  effectiveness?: MigraineEpisodeMedicationWriteEffectiveness;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeMedicationWriteRequestEffectiveness = {
  ...EffectivenessEnum,
  ...NullEnum,
} as const;
/**
 * @minimum -32768
 * @maximum 32767
 * @nullable
 */
export type MigraineEpisodeMedicationWriteRequestEffectiveness =
  | (typeof MigraineEpisodeMedicationWriteRequestEffectiveness)[keyof typeof MigraineEpisodeMedicationWriteRequestEffectiveness]
  | null;

export interface MigraineEpisodeMedicationWriteRequest {
  medication: number;
  /**
   * Minutes from episode start when taken (negative = taken before onset)
   * @minimum -2147483648
   * @maximum 2147483647
   * @nullable
   */
  taken_offset_minutes?: number | null;
  /** @maxLength 50 */
  dose?: string;
  /**
   * @minimum -32768
   * @maximum 32767
   * @nullable
   */
  effectiveness?: MigraineEpisodeMedicationWriteRequestEffectiveness;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeWriteHeadacheSide = {
  ...HeadacheSideEnum,
  ...BlankEnum,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeWriteDisabilityLevel = {
  ...DisabilityLevelEnum,
  ...BlankEnum,
} as const;
export interface MigraineEpisodeWrite {
  started_at: string;
  /** @nullable */
  ended_at?: string | null;
  migraine_type?: MigraineTypeEnum;
  /**
   * @minimum 0
   * @maximum 5
   */
  pain_level: number;
  headache_side?: (typeof MigraineEpisodeWriteHeadacheSide)[keyof typeof MigraineEpisodeWriteHeadacheSide];
  headache_regions?: string[];
  disability_level?: (typeof MigraineEpisodeWriteDisabilityLevel)[keyof typeof MigraineEpisodeWriteDisabilityLevel];
  has_aura?: boolean;
  aura_types?: string[];
  visual_aura_locations?: string[];
  /**
   * @minimum 0
   * @maximum 32767
   * @nullable
   */
  aura_duration_minutes?: number | null;
  /**
   * Hours of sleep the night before onset
   * @nullable
   * @pattern ^-?\d{0,3}(?:\.\d{0,1})?$
   */
  sleep_hours_before?: string | null;
  /**
   * @minimum 0
   * @maximum 5
   * @nullable
   */
  stress_level?: number | null;
  /** @nullable */
  menstrual_related?: boolean | null;
  notes?: string;
  triggers?: number[];
  symptoms?: number[];
  episode_medications?: MigraineEpisodeMedicationWrite[];
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeWriteRequestHeadacheSide = {
  ...HeadacheSideEnum,
  ...BlankEnum,
} as const;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodeWriteRequestDisabilityLevel = {
  ...DisabilityLevelEnum,
  ...BlankEnum,
} as const;
export interface MigraineEpisodeWriteRequest {
  started_at: string;
  /** @nullable */
  ended_at?: string | null;
  migraine_type?: MigraineTypeEnum;
  /**
   * @minimum 0
   * @maximum 5
   */
  pain_level: number;
  headache_side?: (typeof MigraineEpisodeWriteRequestHeadacheSide)[keyof typeof MigraineEpisodeWriteRequestHeadacheSide];
  headache_regions?: string[];
  disability_level?: (typeof MigraineEpisodeWriteRequestDisabilityLevel)[keyof typeof MigraineEpisodeWriteRequestDisabilityLevel];
  has_aura?: boolean;
  aura_types?: string[];
  visual_aura_locations?: string[];
  /**
   * @minimum 0
   * @maximum 32767
   * @nullable
   */
  aura_duration_minutes?: number | null;
  /**
   * Hours of sleep the night before onset
   * @nullable
   * @pattern ^-?\d{0,3}(?:\.\d{0,1})?$
   */
  sleep_hours_before?: string | null;
  /**
   * @minimum 0
   * @maximum 5
   * @nullable
   */
  stress_level?: number | null;
  /** @nullable */
  menstrual_related?: boolean | null;
  notes?: string;
  triggers?: number[];
  symptoms?: number[];
  episode_medications?: MigraineEpisodeMedicationWriteRequest[];
}

/**
 * * `aura_only` - Aura only (without headache)
 * `aura_with_headache` - Aura with headache
 * `without_aura` - Migraine without aura
 * `hemiplegic` - Hemiplegic
 * `vestibular` - Vestibular
 * `chronic` - Chronic
 * `cluster` - Cluster
 * `other` - Other
 */
export type MigraineTypeEnum =
  (typeof MigraineTypeEnum)[keyof typeof MigraineTypeEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineTypeEnum = {
  aura_only: "aura_only",
  aura_with_headache: "aura_with_headache",
  without_aura: "without_aura",
  hemiplegic: "hemiplegic",
  vestibular: "vestibular",
  chronic: "chronic",
  cluster: "cluster",
  other: "other",
} as const;

export type NullEnum = (typeof NullEnum)[keyof typeof NullEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const NullEnum = {} as const;

export interface PaginatedMigraineEpisodeListList {
  count: number;
  /** @nullable */
  next?: string | null;
  /** @nullable */
  previous?: string | null;
  results: MigraineEpisodeList[];
}

export interface PasswordChangeRequest {
  /** @minLength 1 */
  old_password: string;
  /** @minLength 1 */
  new_password: string;
  /** @minLength 1 */
  confirm_new_password: string;
}

export interface PatchedUserUpdateRequest {
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username?: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
}

export interface Symptom {
  readonly id: number;
  /** @maxLength 100 */
  name: string;
  category?: SymptomCategoryEnum;
  is_active?: boolean;
  readonly created_at: string;
}

/**
 * * `gi` - Gastrointestinal
 * `sensory` - Sensory
 * `neurological` - Neurological
 * `autonomic` - Autonomic
 * `psychological` - Psychological
 * `other` - Other
 */
export type SymptomCategoryEnum =
  (typeof SymptomCategoryEnum)[keyof typeof SymptomCategoryEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SymptomCategoryEnum = {
  gi: "gi",
  sensory: "sensory",
  neurological: "neurological",
  autonomic: "autonomic",
  psychological: "psychological",
  other: "other",
} as const;

export interface SymptomRequest {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  category?: SymptomCategoryEnum;
  is_active?: boolean;
}

export interface Trigger {
  readonly id: number;
  /** @maxLength 100 */
  name: string;
  category?: TriggerCategoryEnum;
  is_active?: boolean;
  readonly created_at: string;
}

/**
 * * `food` - Food & Drink
 * `hormonal` - Hormonal
 * `stress` - Stress
 * `sleep` - Sleep
 * `environmental` - Environmental
 * `physical` - Physical Activity
 * `sensory` - Sensory
 * `other` - Other
 */
export type TriggerCategoryEnum =
  (typeof TriggerCategoryEnum)[keyof typeof TriggerCategoryEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TriggerCategoryEnum = {
  food: "food",
  hormonal: "hormonal",
  stress: "stress",
  sleep: "sleep",
  environmental: "environmental",
  physical: "physical",
  sensory: "sensory",
  other: "other",
} as const;

export interface TriggerRequest {
  /**
   * @minLength 1
   * @maxLength 100
   */
  name: string;
  category?: TriggerCategoryEnum;
  is_active?: boolean;
}

/**
 * * `triptan` - Triptan
 * `otc_analgesic` - OTC Analgesic
 * `antiemetic` - Antiemetic
 * `preventive` - Preventive
 * `ergotamine` - Ergotamine
 * `gepant` - Gepant / CGRP Antagonist
 * `other` - Other
 */
export type TypeEnum = (typeof TypeEnum)[keyof typeof TypeEnum];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const TypeEnum = {
  triptan: "triptan",
  otc_analgesic: "otc_analgesic",
  antiemetic: "antiemetic",
  preventive: "preventive",
  ergotamine: "ergotamine",
  gepant: "gepant",
  other: "other",
} as const;

export interface User {
  /**
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
  /** @maxLength 150 */
  first_name?: string;
  /** @maxLength 150 */
  last_name?: string;
}

export type MigraineEpisodesListParams = {
  /**
   * * `none` - None — normal activity
   * `mild` - Mild — reduced efficiency
   * `moderate` - Moderate — significant impairment
   * `severe` - Severe — bed rest required
   */
  disability_level?: MigraineEpisodesListDisabilityLevelItem[];
  has_aura?: boolean;
  /**
   * * `aura_only` - Aura only (without headache)
   * `aura_with_headache` - Aura with headache
   * `without_aura` - Migraine without aura
   * `hemiplegic` - Hemiplegic
   * `vestibular` - Vestibular
   * `chronic` - Chronic
   * `cluster` - Cluster
   * `other` - Other
   */
  migraine_type?: MigraineEpisodesListMigraineTypeItem[];
  /**
   * Which field to use when ordering the results.
   */
  ordering?: string;
  /**
   * A page number within the paginated result set.
   */
  page?: number;
  /**
   * Number of results to return per page.
   */
  page_size?: number;
  pain_level_max?: number;
  pain_level_min?: number;
  started_after?: string;
  started_before?: string;
};

export type MigraineEpisodesListDisabilityLevelItem =
  (typeof MigraineEpisodesListDisabilityLevelItem)[keyof typeof MigraineEpisodesListDisabilityLevelItem];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodesListDisabilityLevelItem = {
  mild: "mild",
  moderate: "moderate",
  none: "none",
  severe: "severe",
} as const;

export type MigraineEpisodesListMigraineTypeItem =
  (typeof MigraineEpisodesListMigraineTypeItem)[keyof typeof MigraineEpisodesListMigraineTypeItem];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodesListMigraineTypeItem = {
  aura_only: "aura_only",
  aura_with_headache: "aura_with_headache",
  chronic: "chronic",
  cluster: "cluster",
  hemiplegic: "hemiplegic",
  other: "other",
  vestibular: "vestibular",
  without_aura: "without_aura",
} as const;

export type MigraineEpisodesHeatmapListParams = {
  /**
   * Start date (YYYY-MM-DD), inclusive
   */
  date_from?: string;
  /**
   * End date (YYYY-MM-DD), inclusive
   */
  date_to?: string;
  /**
   * * `none` - None — normal activity
   * `mild` - Mild — reduced efficiency
   * `moderate` - Moderate — significant impairment
   * `severe` - Severe — bed rest required
   */
  disability_level?: MigraineEpisodesHeatmapListDisabilityLevelItem[];
  has_aura?: boolean;
  /**
   * * `aura_only` - Aura only (without headache)
   * `aura_with_headache` - Aura with headache
   * `without_aura` - Migraine without aura
   * `hemiplegic` - Hemiplegic
   * `vestibular` - Vestibular
   * `chronic` - Chronic
   * `cluster` - Cluster
   * `other` - Other
   */
  migraine_type?: MigraineEpisodesHeatmapListMigraineTypeItem[];
  /**
   * Which field to use when ordering the results.
   */
  ordering?: string;
  pain_level_max?: number;
  pain_level_min?: number;
  started_after?: string;
  started_before?: string;
};

export type MigraineEpisodesHeatmapListDisabilityLevelItem =
  (typeof MigraineEpisodesHeatmapListDisabilityLevelItem)[keyof typeof MigraineEpisodesHeatmapListDisabilityLevelItem];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodesHeatmapListDisabilityLevelItem = {
  mild: "mild",
  moderate: "moderate",
  none: "none",
  severe: "severe",
} as const;

export type MigraineEpisodesHeatmapListMigraineTypeItem =
  (typeof MigraineEpisodesHeatmapListMigraineTypeItem)[keyof typeof MigraineEpisodesHeatmapListMigraineTypeItem];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineEpisodesHeatmapListMigraineTypeItem = {
  aura_only: "aura_only",
  aura_with_headache: "aura_with_headache",
  chronic: "chronic",
  cluster: "cluster",
  hemiplegic: "hemiplegic",
  other: "other",
  vestibular: "vestibular",
  without_aura: "without_aura",
} as const;

export type MigraineMedicationsListParams = {
  is_active?: boolean;
  /**
   * Which field to use when ordering the results.
   */
  ordering?: string;
  /**
   * A search term.
   */
  search?: string;
  /**
   * * `triptan` - Triptan
   * `otc_analgesic` - OTC Analgesic
   * `antiemetic` - Antiemetic
   * `preventive` - Preventive
   * `ergotamine` - Ergotamine
   * `gepant` - Gepant / CGRP Antagonist
   * `other` - Other
   */
  type?: MigraineMedicationsListType;
};

export type MigraineMedicationsListType =
  (typeof MigraineMedicationsListType)[keyof typeof MigraineMedicationsListType];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineMedicationsListType = {
  antiemetic: "antiemetic",
  ergotamine: "ergotamine",
  gepant: "gepant",
  otc_analgesic: "otc_analgesic",
  other: "other",
  preventive: "preventive",
  triptan: "triptan",
} as const;

export type MigraineSymptomsListParams = {
  /**
   * * `gi` - Gastrointestinal
   * `sensory` - Sensory
   * `neurological` - Neurological
   * `autonomic` - Autonomic
   * `psychological` - Psychological
   * `other` - Other
   */
  category?: MigraineSymptomsListCategory;
  is_active?: boolean;
  /**
   * Which field to use when ordering the results.
   */
  ordering?: string;
  /**
   * A search term.
   */
  search?: string;
};

export type MigraineSymptomsListCategory =
  (typeof MigraineSymptomsListCategory)[keyof typeof MigraineSymptomsListCategory];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineSymptomsListCategory = {
  autonomic: "autonomic",
  gi: "gi",
  neurological: "neurological",
  other: "other",
  psychological: "psychological",
  sensory: "sensory",
} as const;

export type MigraineTriggersListParams = {
  /**
   * * `food` - Food & Drink
   * `hormonal` - Hormonal
   * `stress` - Stress
   * `sleep` - Sleep
   * `environmental` - Environmental
   * `physical` - Physical Activity
   * `sensory` - Sensory
   * `other` - Other
   */
  category?: MigraineTriggersListCategory;
  is_active?: boolean;
  /**
   * Which field to use when ordering the results.
   */
  ordering?: string;
  /**
   * A search term.
   */
  search?: string;
};

export type MigraineTriggersListCategory =
  (typeof MigraineTriggersListCategory)[keyof typeof MigraineTriggersListCategory];

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const MigraineTriggersListCategory = {
  environmental: "environmental",
  food: "food",
  hormonal: "hormonal",
  other: "other",
  physical: "physical",
  sensory: "sensory",
  sleep: "sleep",
  stress: "stress",
} as const;
