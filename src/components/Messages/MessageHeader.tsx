import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import type { TPreset } from '~/common/dataprovider';;
import { Plugin } from '~/components/svg';
import EndpointOptionsDialog from '../Endpoints/EndpointOptionsDialog';
import { cn, alternateName } from '~/utils/';
import { useLocalize } from '~/hooks';

import store from '~/store';

const MessageHeader = ({ isSearchView = false }) => {
  const [saveAsDialogShow, setSaveAsDialogShow] = useState(false);
  const conversation = useRecoilValue(store.conversation);
  const searchQuery = useRecoilValue(store.searchQuery);
  const localize = useLocalize();

  if (!conversation) {
    return null;
  }

  const { endpoint, model } = conversation;

  if (!endpoint) {
    return null;
  }

  const isNotClickable = endpoint === 'chatGPTBrowser';

  const plugins = (
    <>
      <Plugin /> <span className="px-1">•</span>
      {/* <span className="py-0.25 ml-1 rounded bg-blue-200 px-1 text-[10px] font-semibold uppercase text-[#4559A4]">
        beta
      </span>
      <span className="px-1">•</span> */}
      {localize('com_ui_model')}: {model}
    </>
  );

  const getConversationTitle = () => {
    if (isSearchView) {
      return `Search: ${searchQuery}`;
    } else {
      let _title = `${alternateName[endpoint] ?? endpoint}`;

      if (endpoint === 'azureOpenAI' || endpoint === 'openAI') {
        const { chatGptLabel } = conversation;
        if (model) {
          _title += `: ${model}`;
        }
        if (chatGptLabel) {
          _title += ` as ${chatGptLabel}`;
        }
      } else if (endpoint === 'google') {
        _title = 'PaLM';
        const { modelLabel, model } = conversation;
        if (model) {
          _title += `: ${model}`;
        }
        if (modelLabel) {
          _title += ` as ${modelLabel}`;
        }
      } else if (endpoint === 'bingAI') {
        const { jailbreak, toneStyle } = conversation;
        if (toneStyle) {
          _title += `: ${toneStyle}`;
        }
        if (jailbreak) {
          _title += ' as Sydney';
        }
      } else if (endpoint === 'chatGPTBrowser') {
        if (model) {
          _title += `: ${model}`;
        }
      } else if (endpoint === 'gptPlugins') {
        return plugins;
      } else if (endpoint === 'anthropic') {
        _title = 'Claude';
      } else if (endpoint === null) {
        null;
      } else {
        null;
      }
      return _title;
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex min-h-[60px] w-full flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-white text-sm text-gray-500 transition-all hover:bg-gray-50 hover:bg-opacity-30 dark:border-gray-900/50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:bg-opacity-100',
          isNotClickable ? '' : 'cursor-pointer ',
        )}
        onClick={() => (isNotClickable ? null : setSaveAsDialogShow(true))}
      >
        <div className="flex flex-1 flex-grow items-center justify-center gap-1 p-1 text-gray-600 dark:text-gray-200 sm:p-0">
          {getConversationTitle()}
        </div>
      </div>

      <EndpointOptionsDialog
        open={saveAsDialogShow}
        onOpenChange={setSaveAsDialogShow}
        preset={conversation as TPreset}
      />
    </>
  );
};

export default MessageHeader;
