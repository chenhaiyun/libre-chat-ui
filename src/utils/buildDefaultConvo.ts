import { parseConvo } from '~/common/dataprovider';;
import getLocalStorageItems from './getLocalStorageItems';
import type { TConversation, EModelEndpoint } from '~/common/dataprovider';;

const buildDefaultConvo = ({
  conversation,
  endpoint,
  models,
  lastConversationSetup,
}: {
  conversation: TConversation;
  endpoint: EModelEndpoint;
  models: string[];
  lastConversationSetup: TConversation;
}) => {
  const { lastSelectedModel, lastSelectedTools, lastBingSettings } = getLocalStorageItems();
  const { jailbreak, toneStyle } = lastBingSettings;

  if (!endpoint) {
    return {
      ...conversation,
      endpoint,
    };
  }

  const availableModels = models;
  const model = lastConversationSetup?.model ?? lastSelectedModel?.[endpoint];
  const secondaryModel =
    endpoint === 'gptPlugins'
      ? lastConversationSetup?.agentOptions?.model ?? lastSelectedModel?.secondaryModel
      : null;

  let possibleModels: string[], secondaryModels: string[];

  if (availableModels.includes(model)) {
    possibleModels = [model, ...availableModels];
  } else {
    possibleModels = [...availableModels];
  }

  if (secondaryModel && availableModels.includes(secondaryModel)) {
    secondaryModels = [secondaryModel, ...availableModels];
  } else {
    secondaryModels = [...availableModels];
  }

  const convo = parseConvo(endpoint, lastConversationSetup, {
    models: possibleModels,
    secondaryModels,
  });
  const defaultConvo = {
    ...conversation,
    ...convo,
    endpoint,
  };

  defaultConvo.tools = lastSelectedTools ?? defaultConvo.tools;
  defaultConvo.jailbreak = jailbreak ?? defaultConvo.jailbreak;
  defaultConvo.toneStyle = toneStyle ?? defaultConvo.toneStyle;

  return defaultConvo;
};

export default buildDefaultConvo;
