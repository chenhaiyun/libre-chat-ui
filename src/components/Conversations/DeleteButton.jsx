import { useEffect } from 'react';
import TrashIcon from '../svg/TrashIcon';
import CrossIcon from '../svg/CrossIcon';
import { useRecoilValue } from 'recoil';
import { useDeleteConversationMutation } from '~/common/dataprovider';;
import { Dialog, DialogTrigger, Label } from '~/components/ui/';
import DialogTemplate from '~/components/ui/DialogTemplate';
import { useLocalize, useConversations, useConversation } from '~/hooks';
import store from '~/store';

export default function DeleteButton({ conversationId, renaming, retainView, title }) {
  const localize = useLocalize();
  const currentConversation = useRecoilValue(store.conversation) || {};
  const { newConversation } = useConversation();
  const { refreshConversations } = useConversations();

  const confirmDelete = () => {
    deleteConvoMutation.mutate({ conversationId, source: 'button' });
  };

  const deleteConvoMutation = useDeleteConversationMutation(conversationId);

  useEffect(() => {
    if (deleteConvoMutation.isSuccess) {
      if (currentConversation?.conversationId == conversationId) {
        newConversation();
      }

      refreshConversations();
      retainView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteConvoMutation.isSuccess]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="p-1 hover:text-white">{renaming ? <CrossIcon /> : <TrashIcon />}</button>
      </DialogTrigger>
      <DialogTemplate
        title={localize('com_ui_delete_conversation')}
        className="max-w-[450px]"
        main={
          <>
            <div className="flex w-full flex-col items-center gap-2">
              <div className="grid w-full items-center gap-2">
                <Label htmlFor="chatGptLabel" className="text-left text-sm font-medium">
                  {localize('com_ui_delete_conversation_confirm')} <strong>{title}</strong>
                </Label>
              </div>
            </div>
          </>
        }
        selection={{
          selectHandler: confirmDelete,
          selectClasses: 'bg-red-600 hover:bg-red-700 dark:hover:bg-red-800 text-white',
          selectText: localize('com_ui_delete'),
        }}
      />
    </Dialog>
  );
}
