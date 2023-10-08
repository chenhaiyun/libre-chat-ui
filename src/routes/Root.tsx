/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Outlet } from 'react-router-dom';
import {
  useGetEndpointsQuery,
  useGetModelsQuery,
  useGetPresetsQuery,
  useGetSearchEnabledQuery,
} from '~/common/dataprovider';

import { Nav, MobileNav } from '~/components/Nav';
import { useAuthContext, useServerStream } from '~/hooks';
import store from '~/store';

export default function Root() {
  const { user, isAuthenticated } = useAuthContext();
  const [navVisible, setNavVisible] = useState(() => {
    const savedNavVisible = localStorage.getItem('navVisible');
    return savedNavVisible !== null ? JSON.parse(savedNavVisible) : false;
  });

  const submission = useRecoilValue(store.submission);
  useServerStream(submission ?? null);

  const setPresets = useSetRecoilState(store.presets);
  const setIsSearchEnabled = useSetRecoilState(store.isSearchEnabled);
  const setEndpointsConfig = useSetRecoilState(store.endpointsConfig);
  const setModelsConfig = useSetRecoilState(store.modelsConfig);

  const searchEnabledQuery = useGetSearchEnabledQuery();
  const endpointsQuery = useGetEndpointsQuery();
  const modelsQuery = useGetModelsQuery();
  const presetsQuery = useGetPresetsQuery({ enabled: !!user });

  useEffect(() => {
    localStorage.setItem('navVisible', JSON.stringify(navVisible));
  }, [navVisible]);

  useEffect(() => {
    if (endpointsQuery.data) {
      setEndpointsConfig(endpointsQuery.data);
    } else if (endpointsQuery.isError) {
      console.error('Failed to get endpoints', endpointsQuery.error);
    }
  }, [endpointsQuery.data, endpointsQuery.isError]);

  useEffect(() => {
    if (modelsQuery.data) {
      setModelsConfig(modelsQuery.data);
    } else if (modelsQuery.isError) {
      console.error('Failed to get models', modelsQuery.error);
    }
  }, [modelsQuery.data, modelsQuery.isError]);

  useEffect(() => {
    if (presetsQuery.data) {
      setPresets(presetsQuery.data);
    } else if (presetsQuery.isError) {
      console.error('Failed to get presets', presetsQuery.error);
    }
  }, [presetsQuery.data, presetsQuery.isError]);

  useEffect(() => {
    if (searchEnabledQuery.data) {
      setIsSearchEnabled(searchEnabledQuery.data);
    } else if (searchEnabledQuery.isError) {
      console.error('Failed to get search enabled', searchEnabledQuery.error);
    }
  }, [searchEnabledQuery.data, searchEnabledQuery.isError]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="flex h-screen">
        <Nav navVisible={navVisible} setNavVisible={setNavVisible} />
        <div className="flex h-full w-full flex-1 flex-col bg-gray-50">
          <div className="transition-width relative flex h-full w-full flex-1 flex-col items-stretch overflow-hidden bg-white pt-10 dark:bg-gray-800 md:pt-0">
            <MobileNav setNavVisible={setNavVisible} />
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
