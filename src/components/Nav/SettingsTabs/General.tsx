import { useRecoilState } from 'recoil';
import * as Tabs from '@radix-ui/react-tabs';
import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useClearConversationsMutation } from '~/common/dataprovider';;
import {
  ThemeContext,
  useLocalize,
  useOnClickOutside,
  useConversation,
  useConversations,
} from '~/hooks';
import type { TDangerButtonProps } from '~/common';
import DangerButton from './DangerButton';
import store from '~/store';
import useLocalStorage from '~/hooks/useLocalStorage';

export const ThemeSelector = ({
  theme,
  onChange,
}: {
  theme: string;
  onChange: (value: string) => void;
}) => {
  const localize = useLocalize();

  return (
    <div className="flex items-center justify-between">
      <div>{localize('com_nav_theme')}</div>
      <select
        className="w-24 rounded border border-black/10 bg-transparent text-sm dark:border-white/20 dark:bg-gray-900"
        onChange={(e) => onChange(e.target.value)}
        value={theme}
      >
        <option value="system">{localize('com_nav_theme_system')}</option>
        <option value="dark">{localize('com_nav_theme_dark')}</option>
        <option value="light">{localize('com_nav_theme_light')}</option>
      </select>
    </div>
  );
};

export const ClearChatsButton = ({
  confirmClear,
  className = '',
  showText = true,
  mutation,
  onClick,
}: Pick<
  TDangerButtonProps,
  'confirmClear' | 'mutation' | 'className' | 'showText' | 'onClick'
>) => {
  return (
    <DangerButton
      id="clearConvosBtn"
      mutation={mutation}
      confirmClear={confirmClear}
      className={className}
      showText={showText}
      infoTextCode="com_nav_clear_all_chats"
      actionTextCode="com_ui_clear"
      confirmActionTextCode="com_nav_confirm_clear"
      dataTestIdInitial="clear-convos-initial"
      dataTestIdConfirm="clear-convos-confirm"
      onClick={onClick}
    />
  );
};

export const LangSelector = ({
  langcode,
  onChange,
}: {
  langcode: string;
  onChange: (value: string) => void;
}) => {
  const localize = useLocalize();

  return (
    <div className="flex items-center justify-between">
      <div>{localize('com_nav_language')}</div>
      <select
        className="w-24 rounded border border-black/10 bg-transparent text-sm dark:border-white/20 dark:bg-gray-900"
        onChange={(e) => onChange(e.target.value)}
        value={langcode}
      >
        <option value="auto">{localize('com_nav_lang_auto')}</option>
        <option value="en-US">{localize('com_nav_lang_english')}</option>
        <option value="zh-CN">{localize('com_nav_lang_chinese')}</option>
        <option value="de-DE">{localize('com_nav_lang_german')}</option>
        <option value="es-ES">{localize('com_nav_lang_spanish')}</option>
        <option value="fr-FR">{localize('com_nav_lang_french')}</option>
        <option value="it-IT">{localize('com_nav_lang_italian')}</option>
        <option value="pl-PL">{localize('com_nav_lang_polish')}</option>
        <option value="pt-BR">{localize('com_nav_lang_brazilian_portuguese')}</option>
        <option value="ru-RU">{localize('com_nav_lang_russian')}</option>
        <option value="ja-JP">{localize('com_nav_lang_japanese')}</option>
        <option value="sv-SE">{localize('com_nav_lang_swedish')}</option>
        <option value="ko-KR">{localize('com_nav_lang_korean')}</option>
      </select>
    </div>
  );
};

function General() {
  const { theme, setTheme } = useContext(ThemeContext);
  const clearConvosMutation = useClearConversationsMutation();
  const [confirmClear, setConfirmClear] = useState(false);
  const [langcode, setLangcode] = useRecoilState(store.lang);
  const [selectedLang, setSelectedLang] = useLocalStorage('selectedLang', langcode);
  const { newConversation } = useConversation();
  const { refreshConversations } = useConversations();

  const contentRef = useRef(null);
  useOnClickOutside(contentRef, () => confirmClear && setConfirmClear(false), []);

  useEffect(() => {
    if (clearConvosMutation.isSuccess) {
      newConversation();
      refreshConversations();
    }
  }, [clearConvosMutation.isSuccess, newConversation, refreshConversations]);

  const clearConvos = useCallback(() => {
    if (confirmClear) {
      console.log('Clearing conversations...');
      clearConvosMutation.mutate({});
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
    }
  }, [confirmClear, clearConvosMutation]);

  const changeTheme = useCallback(
    (value: string) => {
      setTheme(value);
    },
    [setTheme],
  );

  const changeLang = useCallback(
    (value: string) => {
      setSelectedLang(value);
      if (value === 'auto') {
        const userLang = navigator.language || navigator.languages[0];
        setLangcode(userLang);
        localStorage.setItem('lang', userLang);
      } else {
        setLangcode(value);
        localStorage.setItem('lang', value);
      }
    },
    [setLangcode, setSelectedLang],
  );

  return (
    <Tabs.Content
      value="general"
      role="tabpanel"
      className="w-full md:min-h-[300px]"
      ref={contentRef}
    >
      <div className="flex flex-col gap-3 text-sm text-gray-600 dark:text-gray-300">
        <div className="border-b pb-3 last-of-type:border-b-0 dark:border-gray-700">
          <ThemeSelector theme={theme} onChange={changeTheme} />
        </div>
        <div className="border-b pb-3 last-of-type:border-b-0 dark:border-gray-700">
          <LangSelector langcode={selectedLang} onChange={changeLang} />
        </div>
        <div className="border-b pb-3 last-of-type:border-b-0 dark:border-gray-700">
          <ClearChatsButton
            confirmClear={confirmClear}
            onClick={clearConvos}
            showText={true}
            mutation={clearConvosMutation}
          />
        </div>
      </div>
    </Tabs.Content>
  );
}

export default React.memo(General);
