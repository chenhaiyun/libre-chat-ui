import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  useGetMessagesByConvoId,
  useGetConversationByIdMutation,
  useGetStartupConfig,
} from '~/common/dataprovider';

import Landing from '~/components/ui/Landing';
import Messages from '~/components/Messages/Messages';
import TextChat from '~/components/Input/TextChat';

import { useAuthContext, useConversation } from '~/hooks';
import store from '~/store';

export default function Chat() {
  const { isAuthenticated } = useAuthContext();
  const [shouldNavigate, setShouldNavigate] = useState(true);
  const searchQuery = useRecoilValue(store.searchQuery);
  const [conversation, setConversation] = useRecoilState(store.conversation);
  const setMessages = useSetRecoilState(store.messages);
  const messagesTree = useRecoilValue(store.messagesTree);
  const isSubmitting = useRecoilValue(store.isSubmitting);
  const { newConversation } = useConversation();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  //disabled by default, we only enable it when messagesTree is null
  const messagesQuery = useGetMessagesByConvoId(conversationId ?? '', { enabled: false });
  const getConversationMutation = useGetConversationByIdMutation(conversationId ?? '');
  const { data: config } = useGetStartupConfig();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isSubmitting && !shouldNavigate) {
      setShouldNavigate(true);
    }
  }, [shouldNavigate, isSubmitting]);

  // when conversation changed or conversationId (in url) changed
  useEffect(() => {
    // No current conversation and conversationId is 'new'
    if (conversation === null && conversationId === 'new') {
      newConversation();
      setShouldNavigate(true);
    }
    // No current conversation and conversationId exists
    else if (conversation === null && conversationId) {
      getConversationMutation.mutate(conversationId, {
        onSuccess: (data) => {
          console.log('Conversation fetched successfully');
          setConversation(data);
          setShouldNavigate(true);
        },
        onError: (error) => {
          console.error('Failed to fetch the conversation');
          console.error(error);
          navigate('/chat/new');
          newConversation();
          setShouldNavigate(true);
        },
      });
      setMessages(null);
    }
    // No current conversation and no conversationId
    else if (conversation === null) {
      navigate('/chat/new');
      setShouldNavigate(true);
    }
    // Current conversationId is 'search'
    else if (conversation?.conversationId === 'search') {
      navigate(`/search/${searchQuery}`);
      setShouldNavigate(true);
    }
    // Conversation change and isSubmitting
    else if (conversation?.conversationId !== conversationId && isSubmitting) {
      setShouldNavigate(false);
    }
    // conversationId (in url) should always follow conversation?.conversationId, unless conversation is null
    else if (conversation?.conversationId !== conversationId) {
      if (shouldNavigate) {
        navigate(`/chat/${conversation?.conversationId}`);
      } else {
        setShouldNavigate(true);
      }
    }
    document.title = conversation?.title || config?.appTitle || 'Chat';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation, conversationId, config]);

  useEffect(() => {
    if (messagesTree === null && conversation?.conversationId) {
      messagesQuery.refetch({ queryKey: [conversation?.conversationId] });
    }
  }, [conversation?.conversationId, messagesQuery, messagesTree]);

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data);
    } else if (messagesQuery.isError) {
      console.error('failed to fetch the messages');
      console.error(messagesQuery.error);
      setMessages(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesQuery.data, messagesQuery.isError, setMessages]);

  if (!isAuthenticated) {
    return null;
  }

  // if not a conversation
  if (conversation?.conversationId === 'search') {
    return null;
  }
  // if conversationId not match
  if (conversation?.conversationId !== conversationId && !conversation) {
    return null;
  }
  // if conversationId is null
  if (!conversationId) {
    return null;
  }

  if (conversationId && !messagesTree) {
    return (
      <>
        <Messages />
        <TextChat />
      </>
    );
  }

  return (
    <>
      {conversationId === 'new' && !messagesTree?.length ? <Landing /> : <Messages />}
      <TextChat />
    </>
  );
}
