// import { kams as dummyKams } from '@/types/kam';
// import type { KAM } from '@/types/kam';

// export const KAMService = {
//   getAll: (): Promise<KAM[]> => {
//     return Promise.resolve(dummyKams); // Return dummy KAMs as Promise
//   },
// };

// src/services/kam.ts
// import { kams as dummyKams } from '@/types/kam';

// export const KAMService = {
//   getAll: async () => {
//     return Promise.resolve(dummyKams);
//   },
// };

import { kams as dummyKams } from '@/types/kam';

export const KAMService = {
  getAll: async () => {
    return Promise.resolve(dummyKams); // promise return করবে API এর মতো
  },
};
