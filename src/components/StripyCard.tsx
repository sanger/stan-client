import React from 'react';
import Heading from './Heading';

interface StripyCardProps extends React.PropsWithChildren {
  heading: string | React.ReactNode;
  description?: string | null | React.ReactNode;
}

const StripyCard: React.FC<StripyCardProps> = ({ heading, description, children }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        {typeof heading === 'string' ? (
          <Heading level={3} showBorder={false}>
            {heading}
          </Heading>
        ) : (
          heading
        )}
        {description && <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>}
      </div>
      <div className="border-t border-gray-200">
        <dl>{children}</dl>
      </div>
    </div>
  );
};

export default StripyCard;

interface StripyCardDetailProps extends React.PropsWithChildren {
  term: string;
}

export const StripyCardDetail: React.FC<StripyCardDetailProps> = ({ term, children }) => (
  <div className="odd:bg-gray-50 even:bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
    <dt className="text-sm font-medium text-gray-500">{term}</dt>
    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{children}</dd>
  </div>
);
