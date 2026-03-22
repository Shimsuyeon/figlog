export interface BuildEventNameParams {
  action: string;
  folder: string;
  component: string;
  id?: string;
  domainMap: Record<string, string>;
}

export interface BuildPlacementParams {
  screen?: string;
  folder: string;
  domainMap: Record<string, string>;
}

/**
 * Build an event name from component metadata.
 *
 * DA-defined mode (id present): `{action}{Domain}{id}` e.g. `clickOnlineShopAddToCart`
 * Auto-generated mode (no id):  `{folder}.{component}.{action}` e.g. `shop.ProductList.click`
 */
export function buildEventName({
  action,
  folder,
  component,
  id,
  domainMap,
}: BuildEventNameParams): string {
  if (id) {
    const domain = domainMap[folder] ?? capitalize(folder);
    return `${action}${capitalize(domain)}${capitalize(id)}`;
  }
  return `${folder}.${component}.${action}`;
}

/**
 * Build a placement string from screen/folder metadata.
 *
 * With screen: `{domainLower}{Screen}` e.g. `onlineShopProductList`
 * Without screen: `{domainLower}` e.g. `onlineShop`
 */
export function buildPlacement({
  screen,
  folder,
  domainMap,
}: BuildPlacementParams): string {
  const domain = domainMap[folder] ?? folder;
  const domainLower = domain.charAt(0).toLowerCase() + domain.slice(1);

  if (screen) {
    return `${domainLower}${capitalize(screen)}`;
  }
  return domainLower;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
