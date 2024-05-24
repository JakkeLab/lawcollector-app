import { useState } from "react"
import { LawListItem } from "../common/list/lawlistitem"
import { LawListHeader } from "../common/list/lawlistitemheader"

export default function LawList() {
    const [currentFilName, setFileName] = useState('');

    const widthSet = {
        widthCb : 30,
        widthLawCode : 80,
    }

    const refreshLawList = () => {
        window.electronAPI.getLawListFromFlie();
    }

    const checkItem = () => {

    }

    return (
    <div className='flex flex-row w-full mt-2'>
        <div className='flex flex-col'>
                <div className='w-[240px] flex flex-row items-center h-[25px]'>
                    <div className='flex-grow align-center self-center'>
                        법률 리스트
                    </div>
                    <div>
                        <button className='element-button w-[70px] place-content-end' onClick={refreshLawList}>가져오기</button>
                    </div>
                </div>
                <hr className='element-hr-style2 w-[100%]'/>
                <div className='w-[240px] flex flex-row items-center h-[25px]'>
                    <div className='flex-grow align-center self-center'>
                        파일명
                    </div>
                    <div>
                        {currentFilName}
                    </div>
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
                <div>
                    <LawListHeader dimensions={widthSet} lawName="법률명" lawCode="법률코드" checkHandler={checkItem}/>
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
                <div>

                </div>
        </div>
        <div className='flex-grow ml-2'>
            <div className="flex flex-col">
                <div className="flex flex-row flex-grow h-[25px]">
                    <div className='flex-grow align-center self-center'>
                        검색결과
                    </div>
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
            </div>
        </div>
      </div>
    )
}