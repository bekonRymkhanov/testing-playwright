export interface ProductRef {
  name: string;
}

export const products = {
  thorHammer: { name: 'Thor Hammer' },
  boltCutters: { name: 'Bolt Cutters' },
  combinationPliers: { name: 'Combination Pliers' },
} satisfies Record<string, ProductRef>;
