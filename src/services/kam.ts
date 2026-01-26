// src/services/kam.ts

import { kams as dummyKams } from '@/types/kam';

export const KAMService = {
  getAll: async () => {
    return Promise.resolve(dummyKams); // promise return করবে API এর মতো
  },
};
