export const APP_VALUES = ["esttu", "gittu", "admin"] as const;
export type APP = (typeof APP_VALUES)[number];
