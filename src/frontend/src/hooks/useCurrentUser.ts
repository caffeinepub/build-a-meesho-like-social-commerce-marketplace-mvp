import { useInternetIdentity } from './useInternetIdentity';
import { useGetCallerUserProfile } from './useQueries';
import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';

export const CURRENT_USER_ROLE_QUERY_KEY = ['currentUserRole'];

export function useCurrentUser() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const roleQuery = useQuery({
    queryKey: CURRENT_USER_ROLE_QUERY_KEY,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const isAdmin = await actor.isCallerAdmin();
      return isAdmin;
    },
    enabled: !!actor && !!identity && !actorFetching,
    retry: false,
  });

  return {
    identity,
    userProfile,
    isLoading: profileLoading || roleQuery.isLoading,
    isFetched,
    isAdmin: roleQuery.data || false,
  };
}
