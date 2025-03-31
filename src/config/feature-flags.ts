export type FeatureFlag = {
  name: string;
  description: string;
  enabled: boolean;
  defaultValue: boolean;
  envKey?: string;
};

export const featureFlags: Record<string, FeatureFlag> = {
  SKIP_AUTH: {
    name: "Skip Authentication",
    description: "Bypass authentication in development mode",
    enabled: process.env.NEXT_PUBLIC_SKIP_AUTH === "true",
    defaultValue: false,
    envKey: "NEXT_PUBLIC_SKIP_AUTH",
  },
  DARK_MODE: {
    name: "Dark Mode",
    description: "Enable dark mode theme",
    enabled: true,
    defaultValue: true,
  },
};

export function isFeatureEnabled(featureKey: string): boolean {
  const feature = featureFlags[featureKey];
  if (!feature) {
    return false;
  }

  return feature.enabled;
}
