import React from 'react';
import { useLoaderData, useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../AppShell';
import variants from '../../lib/motionVariants';
import Heading from '../Heading';
import { Input } from '../forms/Input';
import GrayBox, { Sidebar } from '../layouts/GrayBox';
import PinkButton from '../buttons/PinkButton';
import { motion } from 'framer-motion';
import DownloadIcon from '../icons/DownloadIcon';
import Warning from '../notifications/Warning';

const ReleaseOptions = () => {
  //Get all release options
  const releaseOptions = useLoaderData() as string[];

  //Get query params, expected url example is /releaseOptions?id=123,456&groups=group1,group2
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  //Extract id and groups from query params
  const memoReleaseParams = React.useMemo(() => {
    return {
      id: searchParams.get('id')?.split(',') ?? [],
      groups: searchParams.get('groups')?.split(',') ?? []
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
                <Heading level={3}>Release Columns</Heading>
                {releaseOptions && releaseOptions.length > 0 ? (
                  releaseOptions.map((releaseOption: string) => (
                    <div className="flex flex-row items-center gap-x-2" key={releaseOption}>
                      <Input
                        type="checkbox"
                        className={'w-5 rounded'}
                        checked={memoReleaseParams.groups.includes(releaseOption)}
                        onChange={(values) => {
                          const valuesToSend = {
                            id: memoReleaseParams.id,
                            groups: [
                              memoReleaseParams.groups.includes(releaseOption)
                                ? memoReleaseParams.groups.filter((item) => item !== releaseOption)
                                : [...memoReleaseParams.groups, releaseOption]
                            ]
                          };
                          navigate(
                            `/releaseOptions?id=${valuesToSend.id.join(',')}&groups=${valuesToSend.groups.join(',')}`,
                            {
                              replace: true
                            }
                          );
                        }}
                      />
                      <label className={'whitespace-nowrap'}>{releaseOption}</label>
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
                  className="w-full text-gray-800 focus:outline-none"
                  download={'release.tsv'}
                  href={`/release?id=${memoReleaseParams.id.join(',')}&groups=${memoReleaseParams.groups.join(',')}`}
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
