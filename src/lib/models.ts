export type ModelOption = {
  id: string;
  name: string;
  desc?: string;
};

export const DEFAULT_MODEL: ModelOption = {
  id: "sonnet-4.6",
  name: "Sonnet 4.6",
  desc: "Responsive everyday work",
};

export const MORE_MODELS: { featured: ModelOption[]; legacy: ModelOption[] } = {
  featured: [
    { id: "opus-4.7", name: "Opus 4.7", desc: "Most capable reasoning" },
    { id: "haiku-4.5", name: "Haiku 4.5", desc: "Fastest, lightweight tasks" },
  ],
  legacy: [
    { id: "opus-4.6", name: "Opus 4.6", desc: "Previous flagship" },
    { id: "opus-3", name: "Opus 3", desc: "Legacy long-form reasoning" },
    { id: "sonnet-4.5", name: "Sonnet 4.5", desc: "Previous everyday" },
  ],
};

export const ALL_MODELS: ModelOption[] = [
  DEFAULT_MODEL,
  ...MORE_MODELS.featured,
  ...MORE_MODELS.legacy,
];
