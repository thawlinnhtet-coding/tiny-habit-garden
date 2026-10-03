import type { PlantType } from "./garden";

export const plants: Record<
  PlantType,
  { name: string; description: string; color: string }
> = {
  oak: {
    name: "Oak tree",
    description: "Slow roots. Strong branches.",
    color: "#4e9563",
  },
  sunflower: {
    name: "Sunflower",
    description: "A little sunshine, every day.",
    color: "#d6a344",
  },
  mushroom: {
    name: "Mushroom",
    description: "Little wonders in the shade.",
    color: "#cc7760",
  },
  cactus: {
    name: "Cactus",
    description: "Quietly resilient. Always growing.",
    color: "#76a475",
  },
  wildflower: {
    name: "Wildflower",
    description: "Let the small things bloom.",
    color: "#d09685",
  },
};
export const stageNames = [
  "Seed",
  "Sprout",
  "Small plant",
  "Mature plant",
  "Fully grown",
];
