import React from 'react';
import InfoIcon from '../icons/InfoIcon';
import variants from '../../lib/motionVariants';
import { motion } from '../../dependencies/motion';
import classNames from 'classnames';
import FailIcon from '../icons/FailIcon';
import Modal, { ModalBody, ModalHeader } from '../Modal';

interface InformationProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  title?: string;
}

const Information = ({ title, children, className }: InformationProps): JSX.Element => {
  const infoClassName = classNames('relative justify-center align-middle items-center space-x-2', className);
  const [hover, setHover] = React.useState<boolean>(false);

  return (
    <div
      data-testid={'info-div'}
      className={infoClassName}
      onMouseOver={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <InfoIcon className={`bg-white inline-block ${hover ? 'text-blue-600' : 'text-blue-400'}`} />
      {hover && (
        <motion.div variants={variants.fadeInWithLift} initial={'hidden'} animate={'visible'} className="relative">
          <Modal show={hover}>
            <ModalHeader>
              <div className={'flex flex-row items-end justify-end'}>
                <FailIcon
                  onClick={() => setHover(false)}
                  className={`w-5 h-5 cursor-pointer hover:text-red-500 text-red-400
                    }`}
                />
              </div>
              {title && <div>{title}</div>}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col p-1 space-y-2" onMouseLeave={() => setHover(false)}>
                {children}
              </div>
            </ModalBody>
          </Modal>
        </motion.div>
      )}
    </div>
  );
};

export default Information;
