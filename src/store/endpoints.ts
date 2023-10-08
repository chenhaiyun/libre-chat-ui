import { atom, selector } from 'recoil';
import { TEndpointsConfig } from '~/common/dataprovider';;

const endpointsConfig = atom<TEndpointsConfig>({
  key: 'endpointsConfig',
  default: {
    azureOpenAI: null,
    openAI: null,
    bingAI: null,
    chatGPTBrowser: null,
    gptPlugins: null,
    google: null,
    anthropic: null,
  },
});

const plugins = selector({
  key: 'plugins',
  get: ({ get }) => {
    const config = get(endpointsConfig) || {};
    return config?.gptPlugins?.plugins || {};
  },
});

const endpointsFilter = selector({
  key: 'endpointsFilter',
  get: ({ get }) => {
    const config = get(endpointsConfig) || {};

    const filter = {};
    for (const key of Object.keys(config)) {
      filter[key] = !!config[key];
    }
    return filter;
  },
});

const availableEndpoints = selector({
  key: 'availableEndpoints',
  get: ({ get }) => {
    const endpoints = [
      'azureOpenAI',
      'openAI',
      'chatGPTBrowser',
      'gptPlugins',
      'bingAI',
      'google',
      'anthropic',
    ];
    const f = get(endpointsFilter);
    return endpoints.filter((endpoint) => f[endpoint]);
  },
});
// const modelAvailable

export default {
  plugins,
  endpointsConfig,
  endpointsFilter,
  availableEndpoints,
};
