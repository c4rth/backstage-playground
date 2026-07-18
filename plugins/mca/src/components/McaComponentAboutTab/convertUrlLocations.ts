import { Config } from '@backstage/config';

export type UrlLocation = {
  oldDns: string;
  newDns: string;
};

export type UrlLocations = Array<UrlLocation>;

export function convertUrlLocation(
  url: string | undefined,
  urlLocations: UrlLocations,
): { url: string; originalUrl?: string } {
  if (!url) {
    return { url: '-' };
  }
  for (const location of urlLocations) {
    if (url.startsWith(location.oldDns)) {
      return {
        url: url.replace(location.oldDns, location.newDns),
        originalUrl: url,
      };
    }
  }
  return { url };
}

export function parseUrlLocations(configArray: Config[]): UrlLocations {
  return configArray.map(ruleConfig => {
    const oldDns = ruleConfig.getString('oldDns');
    const newDns = ruleConfig.getString('newDns');
    return { oldDns, newDns };
  });
}
