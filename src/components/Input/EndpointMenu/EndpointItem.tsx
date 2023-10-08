import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Settings } from 'lucide-react';
import { DropdownMenuRadioItem } from '~/components';
import { Icon } from '~/components/Endpoints';
import { SetKeyDialog } from '../SetKeyDialog';
import { useLocalize } from '~/hooks';

import store from '~/store';
import { cn, alternateName } from '~/utils';

export default function ModelItem({
  endpoint,
  value,
  isSelected,
}: {
  endpoint: string;
  value: string;
  isSelected: boolean;
}) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const endpointsConfig = useRecoilValue(store.endpointsConfig);

  const icon = Icon({
    size: 20,
    endpoint,
    error: false,
    className: 'mr-2',
    message: false,
  });

  const userProvidesKey = endpointsConfig?.[endpoint]?.userProvide;
  const localize = useLocalize();

  // regular model
  return (
    <>
      <DropdownMenuRadioItem
        value={value}
        className={cn(
          'group dark:font-semibold dark:text-gray-100 dark:hover:bg-gray-800',
          isSelected ? 'active bg-gray-50 dark:bg-gray-800' : '',
        )}
        id={endpoint}
        data-testid={`endpoint-item-${endpoint}`}
      >
        {icon}
        {alternateName[endpoint] || endpoint}
        {endpoint === 'gptPlugins' && (
          <span className="py-0.25 ml-1 rounded bg-blue-200 px-1 text-[10px] font-semibold text-[#4559A4]">
            Beta
          </span>
        )}
        <div className="flex w-4 flex-1" />
        {userProvidesKey ? (
          <button
            className={cn(
              'invisible m-0 mr-1 flex-initial rounded-md p-0 text-xs font-medium text-gray-400 hover:text-gray-700 group-hover:visible dark:font-normal dark:text-gray-400 dark:hover:text-gray-200',
              isSelected ? 'visible text-gray-700 dark:text-gray-200' : '',
            )}
            onClick={(e) => {
              e.preventDefault();
              setDialogOpen(true);
            }}
          >
            <Settings className="mr-1 inline-block w-[16px] items-center stroke-1" />
            {localize('com_endpoint_config_key')}
          </button>
        ) : null}
      </DropdownMenuRadioItem>
      {userProvidesKey && (
        <SetKeyDialog open={isDialogOpen} onOpenChange={setDialogOpen} endpoint={endpoint} />
      )}
    </>
  );
}
