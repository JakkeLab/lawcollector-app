import React from 'react';

interface StatusBlockProps {
  message: string;
  isAlert: boolean;
  onClose: () => void;
}

export default function StatusBlock({ message, isAlert, onClose }: StatusBlockProps) {
  let componentClassString: string = "flex flex-row mt-2 align-middle content-center items-center p-2 service-status-common ";

  if (isAlert) {
    componentClassString += " status-alert";
  } else {
    componentClassString += " status-ok";
  }

  return (
    <div className={componentClassString}>
        <div className='flex-grow w-[200px] h-[20px] truncate'>
            {message}
        </div>
        <div>
            <button onClick={onClose} className='btn-noeffect ml-4'>✕</button>
        </div>
    </div>
  );
}