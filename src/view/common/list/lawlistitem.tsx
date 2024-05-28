import React, { ChangeEvent, MouseEvent } from 'react';
import { ILawListItemProps } from './lawlistitemprop';
import { ILaw } from '@/lib/apiquery';

export default function LawListItem(
    {law, isAddItems, clickHandler}:
    {law:ILaw, isAddItems:boolean, clickHandler:()=> void}){    
    const sendCheck = (e:MouseEvent<HTMLButtonElement>) => {
        clickHandler();
    }
    return (
        <div>
            <div className={`flex flex-row`}>
                <div className='w-[24px] flex-shrink-0 mr-2'>
                    { isAddItems ? <button onClick={sendCheck} className='btn-add text-center'>+</button> 
                                 : <button onClick={sendCheck} className='btn-remove text-center'>-</button>}
                </div>
                <div className='w-[300px]'>
                    {law.lawNameKorean}
                </div>
                <div className='text-start flex-grow flex-shrink-0 ml-2'>
                    {law.lawId}
                </div>
                <div className='w-[16px]'>

                </div>
            </div>
            <hr className='element-hr-style2'/>
        </div>
    );
};
