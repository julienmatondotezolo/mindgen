/* eslint-disable no-unused-vars */
import { selector } from "recoil";

import { Layer } from "@/_types";

import { layerAtomState } from "../atoms";

export const atomSelector = selector({
  key: "atomSelector",
  get: ({ get }) => get(layerAtomState),
});

// Modified atomSelector to accept an ID parameter
export const getLayerById = ({ id }: { id: string }) =>
  selector<Layer | undefined>({
    key: "getLayerById",
    get: ({ get }: { get: (arg0: typeof layerAtomState) => Layer[] }) => {
      const layers: Layer[] = get(layerAtomState); // Ensure layers is typed correctly

      return layers.find((layer) => layer.id === id); // Returns Layer object or undefined
    },
  });
