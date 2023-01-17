import React from 'react';
import InfoIcon from '../icons/InfoIcon';
import variants from '../../lib/motionVariants';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import Modal, { ModalBody } from '../Modal';
import FailIcon from '../icons/FailIcon';

interface InformationProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {}

const Information = ({ children, className }: InformationProps): JSX.Element => {
  const infoClassName = classNames('relative justify-center space-x-2', className);
  const [hover, setHover] = React.useState<boolean>(false);

  return (
    <div
      data-testid={'info-div'}
      className={infoClassName}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <InfoIcon className={`bg-white inline-block ${hover ? 'text-pink-600' : 'text-pink-400'}`} />
      {hover && (
        <motion.div variants={variants.fadeInWithLift} initial={'hidden'} animate={'visible'} className="relative">
          <Modal show={true}>
            <ModalBody>
              <div className="flex flex-col p-1 items-end justify-end space-y-2" onMouseLeave={() => setHover(false)}>
                <FailIcon
                  onClick={() => setHover(false)}
                  className={`w-5 h-5 cursor-pointer hover:text-red-500 text-red-400
                    }`}
                />
                <motion.div
                  variants={variants.fadeInWithLift}
                  initial={'hidden'}
                  animate={'visible'}
                  className="relative p-4 border-2 border-gray-200"
                  data-testid={'info-content-div'}
                >
                  {children}
                </motion.div>
              </div>
            </ModalBody>
          </Modal>
        </motion.div>
      )}
    </div>
  );
};

export default Information;
