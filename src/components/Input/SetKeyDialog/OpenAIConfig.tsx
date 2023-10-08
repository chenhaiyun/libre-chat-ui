/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
// TODO: Temporarily remove checkbox until Plugins solution for Azure is figured out
// import * as Checkbox from '@radix-ui/react-checkbox';
// import { CheckIcon } from '@radix-ui/react-icons';
import InputWithLabel from './InputWithLabel';
import type { TConfigProps } from '~/common';

function isJson(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const OpenAIConfig = ({ userKey, setUserKey, endpoint }: TConfigProps) => {
  const [showPanel, setShowPanel] = useState(endpoint === 'azureOpenAI');

  useEffect(() => {
    if (isJson(userKey)) {
      setShowPanel(true);
    }
    setUserKey('');
  }, []);

  useEffect(() => {
    if (!showPanel && isJson(userKey)) {
      setUserKey('');
    }
  }, [showPanel]);

  function getAzure(name: string) {
    if (isJson(userKey)) {
      const newKey = JSON.parse(userKey);
      return newKey[name];
    } else {
      return '';
    }
  }

  function setAzure(name: string, value: number | string | boolean) {
    let newKey = {};
    if (isJson(userKey)) {
      newKey = JSON.parse(userKey);
    }
    newKey[name] = value;

    setUserKey(JSON.stringify(newKey));
  }
  return (
    <>
      {!showPanel ? (
        <>
          <InputWithLabel
            id={endpoint}
            value={userKey ?? ''}
            onChange={(e: { target: { value: string } }) => setUserKey(e.target.value ?? '')}
            label={'OpenAI API Key'}
          />
        </>
      ) : (
        <>
          <InputWithLabel
            id={'instanceNameLabel'}
            value={getAzure('azureOpenAIApiInstanceName') ?? ''}
            onChange={(e: { target: { value: string } }) =>
              setAzure('azureOpenAIApiInstanceName', e.target.value ?? '')
            }
            label={'Azure OpenAI Instance Name'}
          />

          <InputWithLabel
            id={'deploymentNameLabel'}
            value={getAzure('azureOpenAIApiDeploymentName') ?? ''}
            onChange={(e: { target: { value: string } }) =>
              setAzure('azureOpenAIApiDeploymentName', e.target.value ?? '')
            }
            label={'Azure OpenAI Deployment Name'}
          />

          <InputWithLabel
            id={'versionLabel'}
            value={getAzure('azureOpenAIApiVersion') ?? ''}
            onChange={(e: { target: { value: string } }) =>
              setAzure('azureOpenAIApiVersion', e.target.value ?? '')
            }
            label={'Azure OpenAI API Version'}
          />

          <InputWithLabel
            id={'apiKeyLabel'}
            value={getAzure('azureOpenAIApiKey') ?? ''}
            onChange={(e: { target: { value: string } }) =>
              setAzure('azureOpenAIApiKey', e.target.value ?? '')
            }
            label={'Azure OpenAI API Key'}
          />
        </>
      )}
      {/* { endpoint === 'gptPlugins' && (
        <div className="flex items-center">
          <Checkbox.Root
            className="flex h-[20px] w-[20px] appearance-none items-center justify-center rounded-[4px] bg-gray-100 text-white outline-none hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-900"
            id="azureOpenAI"
            checked={showPanel}
            onCheckedChange={() => setShowPanel(!showPanel)}
          >
            <Checkbox.Indicator className="flex h-[20px] w-[20px] items-center justify-center rounded-[3.5px] bg-green-600">
              <CheckIcon />
            </Checkbox.Indicator>
          </Checkbox.Root>

          <label
            className="pl-[8px] text-[15px] leading-none dark:text-white"
            htmlFor="azureOpenAI"
          >
          Use Azure OpenAI.
          </label>
        </div>
      )} */}
    </>
  );
};

export default OpenAIConfig;
