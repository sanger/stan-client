import React from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../AppShell';
import variants from '../../lib/motionVariants';
import Heading from '../Heading';
import { Input } from '../forms/Input';
import GrayBox, { Sidebar } from '../layouts/GrayBox';
import PinkButton from '../buttons/PinkButton';
import { motion } from '../../dependencies/motion';
import DownloadIcon from '../icons/DownloadIcon';
import Warning from '../notifications/Warning';
import { ReleaseFileOptionFieldsFragment } from '../../types/sdk';
import { RadioButtonInput } from '../forms/RadioGroup';
import { FileType } from '../../pages/Release';

const ReleaseOptions = () => {
  //Get all release options
  const releaseOptions = useLoaderData() as ReleaseFileOptionFieldsFragment[];

  //Get query params, expected url example is /releaseOptions?id=123,456&groups=group1,group2&type=xlsx
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  //Extract id and groups from query params
  const memoReleaseParams = React.useMemo(() => {
    return {
      id: searchParams.get('id')?.split(',') ?? [],
      groups: searchParams.get('groups')?.split(',') ?? [],
      type: searchParams.get('type') ?? FileType.TSV
    };
  }, [searchParams]);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Title>Release File Options</AppShell.Title>
      </AppShell.Header>
      <AppShell.Main>
        <div className="max-w-screen-xl mx-auto">
          <GrayBox>
            <motion.div
              variants={variants.fadeInParent}
              initial={'hidden'}
              animate={'visible'}
              exit={'hidden'}
              className="md:w-3/4 space-x-4 space-y-10"
            >
              <motion.div variants={variants.fadeInWithLift} className="space-y-4 ">
                <Heading level={3}>File Type</Heading>
                <div className="grid grid-cols-2">
                  <div>
                    <RadioButtonInput
                      data-testid="excel-file"
                      name="excel-file"
                      label={`Excel File`}
                      checked={memoReleaseParams.type === FileType.EXCEL}
                      onChange={() => {
                        navigate(
                          `/releaseOptions?id=${memoReleaseParams.id}&groups=${memoReleaseParams.groups.join(
                            ','
                          )}&type=xlsx`,
                          {
                            replace: true
                          }
                        );
                      }}
                    />
                  </div>
                  <div>
                    <RadioButtonInput
                      data-testid="tsv-file"
                      name="tsv-file"
                      label={`TSV File`}
                      checked={memoReleaseParams.type === FileType.TSV}
                      onChange={() => {
                        navigate(
                          `/releaseOptions?id=${memoReleaseParams.id}&groups=${memoReleaseParams.groups.join(
                            ','
                          )}&type=tsv`,
                          {
                            replace: true
                          }
                        );
                      }}
                    />
                  </div>
                </div>
                <Heading level={3}>Release Columns</Heading>
                {releaseOptions && releaseOptions.length > 0 ? (
                  releaseOptions.map((releaseOption) => (
                    <div className="flex flex-row items-center gap-x-2" key={releaseOption.displayName}>
                      <Input
                        type="checkbox"
                        className={'w-5 rounded'}
                        checked={memoReleaseParams.groups.includes(releaseOption.queryParamName)}
                        onChange={() => {
                          const valuesToSend = {
                            id: memoReleaseParams.id,
                            groups: [
                              memoReleaseParams.groups.includes(releaseOption.queryParamName)
                                ? memoReleaseParams.groups.filter((item) => item !== releaseOption.queryParamName)
                                : [...memoReleaseParams.groups, releaseOption.queryParamName]
                            ]
                          };
                          navigate(
                            `/releaseOptions?id=${valuesToSend.id.join(',')}&groups=${valuesToSend.groups.join(
                              ','
                            )}&type=${memoReleaseParams.type}`,
                            {
                              replace: true
                            }
                          );
                        }}
                      />
                      <label className={'whitespace-nowrap'}>{releaseOption.displayName}</label>
                    </div>
                  ))
                ) : (
                  <Warning data-testid="warning">Please provide Release Columns!"</Warning>
                )}
              </motion.div>
            </motion.div>
            <Sidebar>
              <Heading level={3} showBorder={false}>
                Summary
              </Heading>
              {memoReleaseParams.groups.length > 0 ? (
                <p>
                  <span className="font-semibold">{memoReleaseParams.groups.join(', ')}</span> column(s) added to the
                  release file.
                </p>
              ) : (
                <p className="italic text-sm">Please select release column(s).</p>
              )}
              <PinkButton
                disabled={memoReleaseParams.groups.length === 0 || memoReleaseParams.id.length === 0}
                className="sm:w-full"
              >
                <a
                  className="w-full text-gray-800 focus:outline-hidden"
                  download={`release.${memoReleaseParams.type}`}
                  href={`/release?id=${memoReleaseParams.id.join(',')}&groups=${memoReleaseParams.groups.join(
                    ','
                  )}&type=${memoReleaseParams.type}`}
                >
                  <DownloadIcon className={'inline-block h-5 w-5 -mt-1 -ml-1 mr-2'} />
                  Download Release File
                </a>
              </PinkButton>
            </Sidebar>
          </GrayBox>
        </div>
      </AppShell.Main>
    </AppShell>
  );
};

export default ReleaseOptions;
