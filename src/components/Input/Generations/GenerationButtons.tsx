import { useEffect, useState } from 'react';
import type { TMessage } from '~/common/dataprovider';;
import { useMessageHandler, useMediaQuery, useGenerations } from '~/hooks';
import { cn } from '~/utils';
import Regenerate from './Regenerate';
import Continue from './Continue';
import Stop from './Stop';

type GenerationButtonsProps = {
  endpoint: string;
  showPopover: boolean;
  opacityClass: string;
};

export default function GenerationButtons({
  endpoint,
  showPopover,
  opacityClass,
}: GenerationButtonsProps) {
  const {
    messages,
    isSubmitting,
    latestMessage,
    handleContinue,
    handleRegenerate,
    handleStopGenerating,
  } = useMessageHandler();
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const { continueSupported, regenerateEnabled } = useGenerations({
    endpoint,
    message: latestMessage as TMessage,
    isSubmitting,
  });

  const [userStopped, setUserStopped] = useState(false);

  const handleStop = (e: React.MouseEvent<HTMLButtonElement>) => {
    setUserStopped(true);
    handleStopGenerating(e);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (userStopped) {
      timer = setTimeout(() => {
        setUserStopped(false);
      }, 200);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [userStopped]);

  if (isSmallScreen) {
    return null;
  }

  let button: React.ReactNode = null;

  if (isSubmitting) {
    button = <Stop onClick={handleStop} />;
  } else if (userStopped || continueSupported) {
    button = <Continue onClick={handleContinue} />;
  } else if (messages && messages.length > 0 && regenerateEnabled) {
    button = <Regenerate onClick={handleRegenerate} />;
  }

  return (
    <div className="absolute bottom-4 right-0 z-[62]">
      <div className="grow" />
      <div className="flex items-center md:items-end">
        <div
          className={cn('option-buttons', showPopover ? '' : opacityClass)}
          data-projection-id="173"
        >
          {button}
        </div>
      </div>
    </div>
  );
}
