import { NeverRekt } from "./types";

export function createQueryString<Params extends object>(
  params: Params
): string {
  const keys: string[] = Object.keys(params);
  return !!keys.length
    ? `?${keys
        .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
        .join("&")}`
    : "";
}

export function checkParameters<Params>(
  params: Params,
  map: NeverRekt.ParametersMap
): string | boolean {
  const unused: string[] = params
    ? (Object.keys(params) || []).filter((param: string): boolean => {
        return (
          map.findIndex((item): boolean => {
            return item.key === param;
          }) === -1
        );
      })
    : [];

  const missing: (string | undefined)[] = (map || [])
    .map((item) => {
      return (!params && item.required) ||
        (params && !params[item.key] && item.required)
        ? item.key
        : undefined;
    })
    .filter(Boolean);

  if (!!unused.length) {
    console.warn(
      `These are questionable parameters that may be unused: ${unused.join(
        ", "
      )}.`
    );
  }

  if (!!missing.length) {
    return `You are missing the following required parameters: ${missing.join(
      ", "
    )}.`;
  }

  return false;
}
