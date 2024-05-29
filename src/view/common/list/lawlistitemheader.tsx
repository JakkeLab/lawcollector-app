import React, { ChangeEvent } from 'react';
import { ILawListItemProps } from './lawlistitemprop';
import '../../../index.css';

export default function LawListHeader(
    {listItemProps}:   
    {listItemProps:ILawListItemProps}
) {
    return (
        <div className="flex flex-row">
            <div className='w-[32px]'>
                
            </div>
            <div className='w-[420px]'>
                법률명
            </div>
            <div style={{ width: listItemProps.dimensions.widthLawCode }} className='text-start'>
                법률코드
            </div>
                <div className='w-[16px]'>
            </div>
        </div>
    );
};
