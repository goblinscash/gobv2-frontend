import { explorerUrls } from '@/utils/config.utils';
import Link from 'next/link';
import React from 'react';
import { toast } from 'react-toastify';

interface NotifyProps {
  chainId: number;
  txhash: string;
}

const Notify: React.FC<NotifyProps> = ({ chainId, txhash }) => {
  const url = `${explorerUrls[chainId]}/${txhash}`;

  toast.success(
    <div>
      Transaction completed successfully!
      <Link
        href={url}
        className='themeClr font-medium'
        style={{  textDecoration: 'underline', marginLeft: '8px' }}
        target="_blank"
        rel="noopener noreferrer"
      >
        View Transaction
      </Link>
    </div>
  );

  return null;
};

export default Notify;
