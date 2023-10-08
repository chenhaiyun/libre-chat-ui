import * as Tabs from '@radix-ui/react-tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui';
import { CogIcon, DataIcon } from '~/components/svg';
import { useMediaQuery, useLocalize } from '~/hooks';
import type { TDialogProps } from '~/common';
import { General, Data } from './SettingsTabs';
import { cn } from '~/utils';

export default function Settings({ open, onOpenChange }: TDialogProps) {
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const localize = useLocalize();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('shadow-2xl dark:bg-gray-900 dark:text-white md:w-[680px] ')}>
        <DialogHeader>
          <DialogTitle className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
            {localize('com_nav_settings')}
          </DialogTitle>
        </DialogHeader>
        <div className="px-6">
          <Tabs.Root
            defaultValue="general"
            className="flex flex-col gap-6 md:flex-row"
            orientation="vertical"
          >
            <Tabs.List
              aria-label="Settings"
              role="tablist"
              aria-orientation="vertical"
              className={cn(
                '-ml-[8px] flex min-w-[180px] flex-shrink-0 flex-col',
                isSmallScreen ? 'flex-row rounded-lg bg-gray-100 p-1 dark:bg-gray-800/30' : '',
              )}
              style={{ outline: 'none' }}
            >
              <Tabs.Trigger
                className={cn(
                  'group flex items-center justify-start gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 radix-state-active:bg-gray-800 radix-state-active:text-white',
                  isSmallScreen
                    ? 'flex-1 items-center justify-center text-sm dark:text-gray-500 dark:radix-state-active:text-white'
                    : '',
                )}
                value="general"
              >
                <CogIcon className="fill-gray-800" />
                {localize('com_nav_setting_general')}
              </Tabs.Trigger>
              <Tabs.Trigger
                className={cn(
                  'group flex items-center justify-start gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 radix-state-active:bg-gray-800 radix-state-active:text-white',
                  isSmallScreen
                    ? 'flex-1 items-center justify-center text-sm dark:text-gray-500 dark:radix-state-active:text-white'
                    : '',
                )}
                value="data"
              >
                <DataIcon />
                {localize('com_nav_setting_data')}
              </Tabs.Trigger>
            </Tabs.List>
            <General />
            <Data />
          </Tabs.Root>
        </div>
      </DialogContent>
    </Dialog>
  );
}
