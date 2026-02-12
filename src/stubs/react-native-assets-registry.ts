/**
 * Stub for @react-native/assets-registry
 *
 * This module is not needed for web builds. Provides empty stubs so that
 * transitive RN package imports do not break the Vite build.
 */

export type PackagerAsset = {
  __packager_asset: boolean;
  fileSystemLocation: string;
  httpServerLocation: string;
  width?: number;
  height?: number;
  scales: number[];
  hash: string;
  name: string;
  type: string;
};

export function registerAsset(_asset: PackagerAsset): number {
  return 0;
}

export function getAssetByID(_assetId: number): PackagerAsset | undefined {
  return undefined;
}
