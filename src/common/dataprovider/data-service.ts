import * as t from './types';
import * as s from './schemas';
/* TODO: fix dependency cycle */
// eslint-disable-next-line import/no-cycle
import request from './request';
import * as endpoints from './api-endpoints';

export function getConversations(pageNumber: string): Promise<t.TGetConversationsResponse> {
  return request.get(endpoints.conversations(pageNumber));
}

export function abortRequestWithMessage(
  endpoint: string,
  abortKey: string,
  message: string,
): Promise<void> {
  return request.post(endpoints.abortRequest(endpoint), { arg: { abortKey, message } });
}

export function deleteConversation(payload: t.TDeleteConversationRequest) {
  //todo: this should be a DELETE request
  return request.post(endpoints.deleteConversation(), { arg: payload });
}

export function clearAllConversations(): Promise<unknown> {
  return request.post(endpoints.deleteConversation(), { arg: {} });
}

export function revokeUserKey(name: string): Promise<unknown> {
  return request.delete(endpoints.revokeUserKey(name));
}

export function revokeAllUserKeys(): Promise<unknown> {
  return request.delete(endpoints.revokeAllUserKeys());
}

export function getMessagesByConvoId(conversationId: string): Promise<s.TMessage[]> {
  return request.get(endpoints.messages(conversationId));
}

export function getConversationById(id: string): Promise<s.TConversation> {
  return request.get(endpoints.conversationById(id));
}

export function updateConversation(
  payload: t.TUpdateConversationRequest,
): Promise<t.TUpdateConversationResponse> {
  return request.post(endpoints.updateConversation(), { arg: payload });
}

export function updateMessage(payload: t.TUpdateMessageRequest): Promise<unknown> {
  const { conversationId, messageId, text } = payload;
  if (!conversationId) {
    throw new Error('conversationId is required');
  }

  return request.put(endpoints.messages(conversationId, messageId), { text });
}

export function updateUserKey(payload: t.TUpdateUserKeyRequest) {
  const { value } = payload;
  if (!value) {
    throw new Error('value is required');
  }

  return request.put(endpoints.keys(), payload);
}

export function getPresets(): Promise<s.TPreset[]> {
  return request.get(endpoints.presets());
}

export function createPreset(payload: s.TPreset): Promise<s.TPreset[]> {
  return request.post(endpoints.presets(), payload);
}

export function updatePreset(payload: s.TPreset): Promise<s.TPreset[]> {
  return request.post(endpoints.presets(), payload);
}

export function deletePreset(arg: s.TPreset | object): Promise<s.TPreset[]> {
  return request.post(endpoints.deletePreset(), arg);
}

export function getSearchEnabled(): Promise<boolean> {
  return request.get(endpoints.searchEnabled());
}

export function getUser(): Promise<t.TUser> {
  return request.get(endpoints.user());
}

export const searchConversations = async (
  q: string,
  pageNumber: string,
): Promise<t.TSearchResults> => {
  return request.get(endpoints.search(q, pageNumber));
};

export const getAIEndpoints = () => {
  return request.get(endpoints.aiEndpoints());
};

export const getModels = () => {
  return request.get(endpoints.models());
};

export const updateTokenCount = (text: string) => {
  return request.post(endpoints.tokenizer(), { arg: text });
};

export const login = (payload: t.TLoginUser) => {
  return request.post(endpoints.login(), payload);
};

export const logout = () => {
  return request.post(endpoints.logout());
};

export const register = (payload: t.TRegisterUser) => {
  return request.post(endpoints.register(), payload);
};

export const refreshToken = () => request.post(endpoints.refreshToken());

export const userKeyQuery = (name: string): Promise<t.TCheckUserKeyResponse> =>
  request.get(endpoints.userKeyQuery(name));

export const getLoginGoogle = () => {
  return request.get(endpoints.loginGoogle());
};

export const requestPasswordReset = (
  payload: t.TRequestPasswordReset,
): Promise<t.TRequestPasswordResetResponse> => {
  return request.post(endpoints.requestPasswordReset(), payload);
};

export const resetPassword = (payload: t.TResetPassword) => {
  return request.post(endpoints.resetPassword(), payload);
};

export const getAvailablePlugins = (): Promise<s.TPlugin[]> => {
  return request.get(endpoints.plugins());
};

export const updateUserPlugins = (payload: t.TUpdateUserPlugins) => {
  return request.post(endpoints.userPlugins(), payload);
};

export const getStartupConfig = (): Promise<t.TStartupConfig> => {
  return request.get(endpoints.config());
};
