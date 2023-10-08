import { useRecoilValue } from 'recoil';
import type { TConversation, TPreset } from '~/common/dataprovider';;
import { getDefaultEndpoint, buildDefaultConvo } from '~/utils';
import store from '~/store';

type TDefaultConvo = { conversation: Partial<TConversation>; preset?: Partial<TPreset> | null };

const useDefaultConvo = () => {
  const endpointsConfig = useRecoilValue(store.endpointsConfig);
  const modelsConfig = useRecoilValue(store.modelsConfig);

  const getDefaultConversation = ({ conversation, preset }: TDefaultConvo) => {
    const endpoint = getDefaultEndpoint({
      convoSetup: preset as TPreset,
      endpointsConfig,
    });
    const models = modelsConfig?.[endpoint] || [];

    return buildDefaultConvo({
      conversation: conversation as TConversation,
      endpoint,
      lastConversationSetup: preset as TConversation,
      models,
    });
  };

  return getDefaultConversation;
};

export default useDefaultConvo;
