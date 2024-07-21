import { selector } from "recoil";

import { layerAtomState } from "../atoms";

export const atomSelector = selector({
  key: "atomSelector",
  get: ({ get }) => get(layerAtomState),
});
