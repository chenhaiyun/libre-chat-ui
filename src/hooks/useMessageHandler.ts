import { v4 } from 'uuid';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { parseConvo, getResponseSender } from '~/common/dataprovider';;
import type { TMessage, TSubmission, TEndpointOption } from '~/common/dataprovider';;
import type { TAskFunction } from '~/common';
import useUserKey from './useUserKey';
import store from '~/store';

const useMessageHandler = () => {
  const [latestMessage, setLatestMessage] = useRecoilState(store.latestMessage);
  const setSiblingIdx = useSetRecoilState(
    store.messagesSiblingIdxFamily(latestMessage?.parentMessageId),
  );
  const currentConversation = useRecoilValue(store.conversation) || { endpoint: null };
  const setSubmission = useSetRecoilState(store.submission);
  const isSubmitting = useRecoilValue(store.isSubmitting);
  const endpointsConfig = useRecoilValue(store.endpointsConfig);
  const [messages, setMessages] = useRecoilState(store.messages);
  const { endpoint } = currentConversation;
  const { getExpiry } = useUserKey(endpoint ?? '');

  const ask: TAskFunction = (
    { text, parentMessageId = null, conversationId = null, messageId = null },
    {
      editedText = null,
      editedMessageId = null,
      isRegenerate = false,
      isContinued = false,
      isEdited = false,
    } = {},
  ) => {
    if (!!isSubmitting || text === '') {
      return;
    }

    if (endpoint === null) {
      console.error('No endpoint available');
      return;
    }

    conversationId = conversationId ?? currentConversation?.conversationId;
    if (conversationId == 'search') {
      console.error('cannot send any message under search view!');
      return;
    }

    if (isContinued && !latestMessage) {
      console.error('cannot continue AI message without latestMessage!');
      return;
    }

    const isEditOrContinue = isEdited || isContinued;

    // set the endpoint option
    const convo = parseConvo(endpoint, currentConversation);
    const endpointOption = {
      ...convo,
      endpoint,
      key: getExpiry(),
    } as TEndpointOption;
    const responseSender = getResponseSender(endpointOption);

    let currentMessages: TMessage[] | null = messages ?? [];

    // construct the query message
    // this is not a real messageId, it is used as placeholder before real messageId returned
    text = text.trim();
    const fakeMessageId = v4();
    parentMessageId =
      parentMessageId || latestMessage?.messageId || '00000000-0000-0000-0000-000000000000';

    if (conversationId == 'new') {
      parentMessageId = '00000000-0000-0000-0000-000000000000';
      currentMessages = [];
      conversationId = null;
    }
    const currentMsg: TMessage = {
      sender: 'User',
      text,
      current: true,
      isCreatedByUser: true,
      parentMessageId,
      conversationId,
      messageId: isContinued && messageId ? messageId : fakeMessageId,
      error: false,
    };

    // construct the placeholder response message
    const generation = editedText ?? latestMessage?.text ?? '';
    const responseText = isEditOrContinue
      ? generation
      : '<span className="result-streaming">█</span>';

    const responseMessageId = editedMessageId ?? latestMessage?.messageId ?? null;
    const initialResponse: TMessage = {
      sender: responseSender,
      text: responseText,
      parentMessageId: isRegenerate ? messageId : fakeMessageId,
      messageId: responseMessageId ?? `${isRegenerate ? messageId : fakeMessageId}_`,
      conversationId,
      unfinished: false,
      submitting: true,
      isCreatedByUser: false,
      isEdited: isEditOrContinue,
      error: false,
    };

    if (isContinued) {
      currentMessages = currentMessages.filter((msg) => msg.messageId !== responseMessageId);
    }

    const submission: TSubmission = {
      conversation: {
        ...currentConversation,
        conversationId,
      },
      endpointOption,
      message: {
        ...currentMsg,
        generation,
        responseMessageId,
        overrideParentMessageId: isRegenerate ? messageId : null,
      },
      messages: currentMessages,
      isEdited: isEditOrContinue,
      isContinued,
      isRegenerate,
      initialResponse,
    };

    if (isRegenerate) {
      setMessages([...submission.messages, initialResponse]);
    } else {
      setMessages([...submission.messages, currentMsg, initialResponse]);
    }
    setLatestMessage(initialResponse);
    setSubmission(submission);
  };

  const regenerate = ({ parentMessageId }) => {
    const parentMessage = messages?.find((element) => element.messageId == parentMessageId);

    if (parentMessage && parentMessage.isCreatedByUser) {
      ask({ ...parentMessage }, { isRegenerate: true });
    } else {
      console.error(
        'Failed to regenerate the message: parentMessage not found or not created by user.',
      );
    }
  };

  const continueGeneration = () => {
    if (!latestMessage) {
      console.error('Failed to regenerate the message: latestMessage not found.');
      return;
    }

    const parentMessage = messages?.find(
      (element) => element.messageId == latestMessage.parentMessageId,
    );

    if (parentMessage && parentMessage.isCreatedByUser) {
      ask({ ...parentMessage }, { isContinued: true, isRegenerate: true, isEdited: true });
    } else {
      console.error(
        'Failed to regenerate the message: parentMessage not found, or not created by user.',
      );
    }
  };

  const stopGenerating = () => {
    setSubmission(null);
  };

  const handleStopGenerating = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    stopGenerating();
  };

  const handleRegenerate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const parentMessageId = latestMessage?.parentMessageId;
    if (!parentMessageId) {
      console.error('Failed to regenerate the message: parentMessageId not found.');
      return;
    }
    regenerate({ parentMessageId });
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    continueGeneration();
    setSiblingIdx(0);
  };

  return {
    ask,
    regenerate,
    stopGenerating,
    handleStopGenerating,
    handleRegenerate,
    handleContinue,
    endpointsConfig,
    latestMessage,
    isSubmitting,
    messages,
  };
};

export default useMessageHandler;
