import axios from 'axios';
import { useEffect } from 'react';
import filenamify from 'filenamify';
import exportFromJSON from 'export-from-json';
import { useSetRecoilState, useRecoilState, useRecoilValue } from 'recoil';
import type { TEditPresetProps } from '~/common';
import { useSetOptions, useLocalize } from '~/hooks';
import { Input, Label, Dropdown, Dialog, DialogClose, DialogButton } from '~/components/';
import DialogTemplate from '~/components/ui/DialogTemplate';
import PopoverButtons from './PopoverButtons';
import EndpointSettings from './EndpointSettings';
import { cn, defaultTextProps, removeFocusOutlines, cleanupPreset } from '~/utils/';
import store from '~/store';

const EditPresetDialog = ({ open, onOpenChange, preset: _preset, title }: TEditPresetProps) => {
  const [preset, setPreset] = useRecoilState(store.preset);
  const setPresets = useSetRecoilState(store.presets);
  const availableEndpoints = useRecoilValue(store.availableEndpoints);
  const { setOption } = useSetOptions(_preset);
  const localize = useLocalize();

  const submitPreset = () => {
    if (!preset) {
      return;
    }
    axios({
      method: 'post',
      url: '/api/presets',
      data: cleanupPreset({ preset }),
      withCredentials: true,
    }).then((res) => {
      setPresets(res?.data);
    });
  };

  const exportPreset = () => {
    if (!preset) {
      return;
    }
    const fileName = filenamify(preset?.title || 'preset');
    exportFromJSON({
      data: cleanupPreset({ preset }),
      fileName,
      exportType: exportFromJSON.types.json,
    });
  };

  useEffect(() => {
    setPreset(_preset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { endpoint } = preset || {};
  if (!endpoint) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTemplate
        title={`${title || localize('com_ui_edit') + ' ' + localize('com_endpoint_preset')} - ${
          preset?.title
        }`}
        className="h-full max-w-full overflow-y-auto pb-4 sm:w-[680px] sm:pb-0 md:h-[720px] md:w-[750px] md:overflow-y-hidden lg:w-[950px] xl:h-[720px]"
        main={
          <div className="flex w-full flex-col items-center gap-2 md:h-[530px]">
            <div className="grid w-full grid-cols-5 gap-6">
              <div className="col-span-4 flex items-start justify-start gap-4">
                <div className="flex w-full flex-col">
                  <Label htmlFor="preset-name" className="mb-1 text-left text-sm font-medium">
                    {localize('com_endpoint_preset_name')}
                  </Label>
                  <Input
                    id="preset-name"
                    value={preset?.title || ''}
                    onChange={(e) => setOption('title')(e.target.value || '')}
                    placeholder={localize('com_endpoint_set_custom_name')}
                    className={cn(
                      defaultTextProps,
                      'flex h-10 max-h-10 w-full resize-none px-3 py-2',
                      removeFocusOutlines,
                    )}
                  />
                </div>
                <div className="flex w-full flex-col">
                  <Label htmlFor="endpoint" className="mb-1 text-left text-sm font-medium">
                    {localize('com_endpoint')}
                  </Label>
                  <Dropdown
                    value={endpoint || ''}
                    onChange={setOption('endpoint')}
                    options={availableEndpoints}
                    className={cn(
                      defaultTextProps,
                      'flex h-10 max-h-10 w-full resize-none ',
                      removeFocusOutlines,
                    )}
                    containerClassName="flex w-full resize-none z-[51]"
                  />
                </div>
              </div>
              <div className="col-span-2 flex items-start justify-start gap-4 sm:col-span-1">
                <div className="flex w-full flex-col">
                  <Label
                    htmlFor="endpoint"
                    className="mb-1 hidden text-left text-sm font-medium sm:block"
                  >
                    {'ㅤ'}
                  </Label>
                  <PopoverButtons
                    endpoint={endpoint}
                    buttonClass="ml-0 w-full dark:bg-gray-700 dark:hover:bg-gray-800 p-2 h-[40px] justify-center mt-0"
                    iconClass="hidden lg:block w-4"
                  />
                </div>
              </div>
            </div>
            <div className="my-4 w-full border-t border-gray-300 dark:border-gray-500" />
            <div className="w-full p-0">
              <EndpointSettings
                conversation={preset}
                setOption={setOption}
                isPreset={true}
                className="h-full md:mb-4 md:h-[440px]"
              />
            </div>
          </div>
        }
        buttons={
          <div className="mb-6 md:mb-2">
            <DialogButton onClick={exportPreset} className="dark:hover:gray-400 border-gray-700">
              {localize('com_endpoint_export')}
            </DialogButton>
            <DialogClose
              onClick={submitPreset}
              className="dark:hover:gray-400 ml-2 border-gray-700 bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-800"
            >
              {localize('com_endpoint_save')}
            </DialogClose>
          </div>
        }
      />
    </Dialog>
  );
};

export default EditPresetDialog;
