/** Release builds and a disabled backend both keep the developer login off. */
export function devLoginUiAllowed(isDevBuild: boolean, backendEnabled: boolean): boolean {
  return isDevBuild === true && backendEnabled === true;
}
