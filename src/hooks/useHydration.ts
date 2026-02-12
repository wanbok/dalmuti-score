import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useHydration(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
