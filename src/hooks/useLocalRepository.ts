import { useQuery } from '@tanstack/react-query';

import type { EntityName } from '@/database';
import { useAuthStore } from '@/core/store/auth.store';
import { repositories } from '@/repositories';

export const useLocalRepository = (
  entity: EntityName,
  options: { search?: string; page?: number; limit?: number } = {},
) => {
  const ownerId = useAuthStore((state) => state.user?.userId ?? '');
  return useQuery({
    queryKey: ['local', ownerId, entity, options],
    queryFn: () => repositories[entity].findAll(ownerId, options),
    enabled: Boolean(ownerId),
    staleTime: 0,
  });
};

