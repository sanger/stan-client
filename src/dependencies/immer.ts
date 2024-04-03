import { enablePatches, enableMapSet, castDraft as cd, produce, Draft } from 'immer';

export function enableAllPlugins() {
  enablePatches();
  enableMapSet();
}

export function castDraft<T>(value: T): Draft<T> {
  return cd(value);
}

export { produce };
