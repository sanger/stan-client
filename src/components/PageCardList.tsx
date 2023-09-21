import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import Heading from './Heading';
import PinkButton from './buttons/PinkButton';
import { FCWithChildren } from '../types/stan';

/**
 * Display a list of cards on navigation pages e.g. Admin
 */
const PageCardList: FCWithChildren = ({ children }) => {
  return <div className="flex flex-row flex-wrap justify-start items-start">{children}</div>;
};

export default PageCardList;

interface PageCardProps extends React.PropsWithChildren {
  page: LinkProps['to'];
  title: string;
}

export const PageCard: React.FC<PageCardProps> = ({ page, title, children }) => (
  <Link to={page} className="w-full md:w-96 lg:w-84">
    <div className="flex flex-col items-center justify-center mb-3 px-20 py-12 hover:bg-gray-100 hover:shadow transition duration-300">
      <Heading level={3} className="text-centre">
        {title}
      </Heading>
      <p className="mt-4 text-center text-gray-600 text-sm">{children}</p>
      <PinkButton action="tertiary">Get Started &gt;</PinkButton>
    </div>
  </Link>
);
