/* eslint-disable react-hooks/exhaustive-deps */
import { useGetConversationByIdQuery } from '~/common/dataprovider';;
import { useEffect } from 'react';
import { useSetRecoilState, useRecoilState } from 'recoil';
import copy from 'copy-to-clipboard';
import { SubRow, Plugin, MessageContent } from './Content';
// eslint-disable-next-line import/no-cycle
import MultiMessage from './MultiMessage';
import HoverButtons from './HoverButtons';
import SiblingSwitch from './SiblingSwitch';
import { Icon } from '~/components/Endpoints';
import { useMessageHandler, useConversation } from '~/hooks';
import type { TMessageProps } from '~/common';
import { cn } from '~/utils';
import store from '~/store';

export default function Message({
  conversation,
  message,
  scrollToBottom,
  currentEditId,
  setCurrentEditId,
  siblingIdx,
  siblingCount,
  setSiblingIdx,
}: TMessageProps) {
  const setLatestMessage = useSetRecoilState(store.latestMessage);
  const [abortScroll, setAbortScroll] = useRecoilState(store.abortScroll);
  const { isSubmitting, ask, regenerate, handleContinue } = useMessageHandler();
  const { switchToConversation } = useConversation();
  const {
    text,
    children,
    messageId = null,
    searchResult,
    isCreatedByUser,
    error,
    unfinished,
  } = message ?? {};
  const isLast = !children?.length;
  const edit = messageId == currentEditId;
  const getConversationQuery = useGetConversationByIdQuery(message?.conversationId ?? '', {
    enabled: false,
  });
  const blinker = message?.submitting && isSubmitting;

  // debugging
  // useEffect(() => {
  //   console.log('isSubmitting:', isSubmitting);
  //   console.log('unfinished:', unfinished);
  // }, [isSubmitting, unfinished]);

  useEffect(() => {
    if (blinker && scrollToBottom && !abortScroll) {
      scrollToBottom();
    }
  }, [isSubmitting, blinker, text, scrollToBottom]);

  useEffect(() => {
    if (!message) {
      return;
    } else if (isLast) {
      setLatestMessage({ ...message });
    }
  }, [isLast, message]);

  if (!message) {
    return null;
  }

  const enterEdit = (cancel?: boolean) =>
    setCurrentEditId && setCurrentEditId(cancel ? -1 : messageId);

  const handleScroll = () => {
    if (blinker) {
      setAbortScroll(true);
    } else {
      setAbortScroll(false);
    }
  };

  const commonClasses =
    'w-full border-b text-gray-800 group border-black/10 dark:border-gray-900/50 dark:text-gray-100';
  const uniqueClasses = isCreatedByUser
    ? 'bg-white dark:bg-gray-800 dark:text-gray-20'
    : 'bg-gray-50 dark:bg-gray-1000 dark:text-gray-70';

  const props = {
    className: cn(commonClasses, uniqueClasses),
    titleclass: '',
  };

  const icon = Icon({
    ...conversation,
    ...message,
    model: message?.model ?? conversation?.model,
  });

  if (message?.bg && searchResult) {
    props.className = message?.bg?.split('hover')[0];
    props.titleclass = message?.bg?.split(props.className)[1] + ' cursor-pointer';
  }

  const regenerateMessage = () => {
    if (!isSubmitting && !isCreatedByUser) {
      regenerate(message);
    }
  };

  const copyToClipboard = (setIsCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsCopied(true);
    copy(text ?? '');

    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  const clickSearchResult = async () => {
    if (!searchResult) {
      return;
    }
    if (!message) {
      return;
    }
    getConversationQuery.refetch({ queryKey: [message?.conversationId] }).then((response) => {
      console.log('getConversationQuery response.data:', response.data);
      if (response.data) {
        switchToConversation(response.data);
      }
    });
  };

  return (
    <>
      <div {...props} onWheel={handleScroll} onTouchMove={handleScroll}>
        <div className="relative m-auto flex gap-4 p-4 text-base md:max-w-2xl md:gap-6 md:py-6 lg:max-w-2xl lg:px-0 xl:max-w-3xl">
          <div className="relative flex h-[30px] w-[30px] flex-col items-end text-right text-xs md:text-sm">
            {typeof icon === 'string' && /[^\\x00-\\x7F]+/.test(icon as string) ? (
              <span className=" direction-rtl w-40 overflow-x-scroll">{icon}</span>
            ) : (
              icon
            )}
            <div className="sibling-switch invisible absolute left-0 top-2 -ml-4 flex -translate-x-full items-center justify-center gap-1 text-xs group-hover:visible">
              <SiblingSwitch
                siblingIdx={siblingIdx}
                siblingCount={siblingCount}
                setSiblingIdx={setSiblingIdx}
              />
            </div>
          </div>
          <div className="relative flex w-[calc(100%-50px)] flex-col gap-1  md:gap-3 lg:w-[calc(100%-115px)]">
            {searchResult && (
              <SubRow
                classes={props.titleclass + ' rounded'}
                subclasses="switch-result pl-2 pb-2"
                onClick={clickSearchResult}
              >
                <strong>{`${message?.title} | ${message?.sender}`}</strong>
              </SubRow>
            )}
            <div className="flex flex-grow flex-col gap-3">
              {/* Legacy Plugins */}
              {message?.plugin && <Plugin plugin={message?.plugin} />}
              <MessageContent
                ask={ask}
                edit={edit}
                isLast={isLast}
                text={text ?? ''}
                message={message}
                enterEdit={enterEdit}
                error={error ?? false}
                isSubmitting={isSubmitting}
                unfinished={unfinished ?? false}
                isCreatedByUser={isCreatedByUser ?? true}
                siblingIdx={siblingIdx ?? 0}
                setSiblingIdx={
                  setSiblingIdx ??
                  (() => {
                    return;
                  })
                }
              />
            </div>
            <HoverButtons
              isEditing={edit}
              isSubmitting={isSubmitting}
              message={message}
              conversation={conversation ?? null}
              enterEdit={enterEdit}
              regenerate={() => regenerateMessage()}
              handleContinue={handleContinue}
              copyToClipboard={copyToClipboard}
            />
            <SubRow subclasses="switch-container">
              <SiblingSwitch
                siblingIdx={siblingIdx}
                siblingCount={siblingCount}
                setSiblingIdx={setSiblingIdx}
              />
            </SubRow>
          </div>
        </div>
      </div>
      <MultiMessage
        messageId={messageId}
        conversation={conversation}
        messagesTree={children ?? []}
        scrollToBottom={scrollToBottom}
        currentEditId={currentEditId}
        setCurrentEditId={setCurrentEditId}
      />
    </>
  );
}
