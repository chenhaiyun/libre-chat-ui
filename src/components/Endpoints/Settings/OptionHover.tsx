import React from 'react';
import { HoverCardPortal, HoverCardContent } from '~/components/ui';
import { ESide } from '~/common';
import { useLocalize } from '~/hooks';

type TOptionHoverProps = {
  endpoint: string;
  type: string;
  side: ESide;
};

const openAI = {
  max: 'com_endpoint_openai_max',
  temp: 'com_endpoint_openai_temp',
  topp: 'com_endpoint_openai_topp',
  freq: 'com_endpoint_openai_freq',
  pres: 'com_endpoint_openai_pres',
};

const types = {
  anthropic: {
    temp: 'com_endpoint_anthropic_temp',
    topp: 'com_endpoint_anthropic_topp',
    topk: 'com_endpoint_anthropic_topk',
    maxoutputtokens: 'com_endpoint_anthropic_maxoutputtokens',
  },
  google: {
    temp: 'com_endpoint_google_temp',
    topp: 'com_endpoint_google_topp',
    topk: 'com_endpoint_google_topk',
    maxoutputtokens: 'com_endpoint_google_maxoutputtokens',
  },
  openAI,
  azureOpenAI: openAI,
  gptPlugins: {
    func: 'com_endpoint_func_hover',
    skip: 'com_endpoint_skip_hover',
    ...openAI,
  },
};

function OptionHover({ endpoint, type, side }: TOptionHoverProps) {
  const localize = useLocalize();
  const text = types?.[endpoint]?.[type];
  if (!text) {
    return null;
  }
  return (
    <HoverCardPortal>
      <HoverCardContent side={side} className="w-80 ">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">{localize(text)}</p>
        </div>
      </HoverCardContent>
    </HoverCardPortal>
  );
}

export default OptionHover;
