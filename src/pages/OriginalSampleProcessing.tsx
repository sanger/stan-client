import React, { useEffect } from 'react';
import AppShell from '../components/AppShell';
import { objectKeys, parseQueryString } from '../lib/helpers';
import BlockProcessing from '../components/originalSampleProcessing/blockProcessing/BlockProcessing';
import variants from '../lib/motionVariants';
import { motion } from 'framer-motion';
import { history, stanCore } from '../lib/sdk';
import PotProcessing from '../components/originalSampleProcessing/potProcessing/PotProcessing';
import { GetBlockProcessingInfoQuery, GetPotProcessingInfoQuery } from '../types/sdk';
import { useLocation } from 'react-router-dom';
import CustomReactSelect, { OptionType } from '../components/forms/CustomReactSelect';
enum OriginalSampleProcessingType {
  BLOCK = 'Block Processing',
  POT = 'Pot Processing'
}

export const OriginalSampleProcessing: React.FC = () => {
  const [processingType, setProcessingType] = React.useState<string>('');
  const [processingInfo, setProcessingInfo] = React.useState<
    GetBlockProcessingInfoQuery | GetPotProcessingInfoQuery | undefined
  >(undefined);

  const location = useLocation();
  /**Set processing Type with selected value**/
  useEffect(() => {
    const queryString = parseQueryString(location.search);

    if (typeof queryString['type'] === 'string' && queryString['type']?.length > 0) {
      if (queryString['type'] === 'block') {
        setProcessingType(OriginalSampleProcessingType.BLOCK);
      }
      if (queryString['type'] === 'pot') {
        setProcessingType(OriginalSampleProcessingType.POT);
      }
    }
  }, [location, setProcessingType]);

  /**Set processing Info based on processing type**/
  useEffect(() => {
    async function fetchAndSetProcessingInfo(
      type: string,
      setFunction: (data: GetBlockProcessingInfoQuery | GetPotProcessingInfoQuery | undefined) => void
    ) {
      let ret;
      if (type === OriginalSampleProcessingType.BLOCK) {
        ret = await stanCore.GetBlockProcessingInfo();
      } else {
        ret = await stanCore.GetPotProcessingInfo();
      }
      if (ret) {
        setFunction(ret);
      }
      return;
    }
    if (processingType !== '' && processingType.length > 0) {
      fetchAndSetProcessingInfo(processingType, setProcessingInfo);
    }
  }, [processingType, setProcessingInfo]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>
          {`Original Sample ${processingType.length !== 0 ? ` - ${processingType}` : 'Processing'}`}
        </AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          {processingType.length === 0 && (
            <div className="my-4 mx-4 max-w-screen-sm sm:mx-auto p-4 rounded-md bg-gray-100">
              <p className="my-3 text-gray-800 text-sm leading-normal">Choose a processing type to get started:</p>

              <div className="flex flex-row items-center justify-center gap-4">
                <CustomReactSelect
                  handleChange={(value) =>
                    history.replace({
                      search: `?type=${
                        (value as OptionType).label === OriginalSampleProcessingType.BLOCK ? 'block' : 'pot'
                      }`
                    })
                  }
                  options={objectKeys(OriginalSampleProcessingType).map((type) => {
                    return {
                      label: OriginalSampleProcessingType[type],
                      value: OriginalSampleProcessingType[type]
                    };
                  })}
                  dataTestId={'processing-type'}
                  className="mt-1 block w-full md:w-1/2"
                />
              </div>
            </div>
          )}

          {processingInfo !== undefined && (
            <motion.div
              variants={variants.fadeInParent}
              initial={'hidden'}
              animate={'visible'}
              exit={'hidden'}
              className="my-4 mx-auto max-w-screen-xl space-y-16 mt-10"
            >
              {processingType === OriginalSampleProcessingType.BLOCK ? (
                <BlockProcessing processingInfo={processingInfo as GetBlockProcessingInfoQuery} />
              ) : (
                <PotProcessing processingInfo={processingInfo as GetPotProcessingInfoQuery} />
              )}
            </motion.div>
          )}
        </div>
      </AppShell.Main>
    </AppShell>
  );
};
