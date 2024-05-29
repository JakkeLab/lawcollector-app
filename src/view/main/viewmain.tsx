import { useRef, useState, useEffect } from 'react';
import '../../index.css';

export default function ViewMain() {
    const [isSettingIdNow, toggleSettingId] = useState<boolean>(false);
    const [apiId, setApiId] = useState<string>('');
    const inputRef = useRef<HTMLInputElement | null>(null);

    const showSettingIdField = (e: React.MouseEvent<HTMLButtonElement>) => {
        window.electronAPI.getApiId().then(res => {
            setApiId(res.apiId); // res 값을 상태에 저장
        });
        toggleSettingId(!isSettingIdNow);
    }

    const handleSetApiId = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (inputRef.current) {
            const idValue = inputRef.current.value;
            window.electronAPI.setApiId(idValue).then(res => {
                if (res.result) {
                    toggleSettingId(!isSettingIdNow);
                } else {
                    console.error(res.result);
                }
            });
        }
    }

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = apiId; // 상태 값으로 input의 값을 설정
        }
    }, [apiId, isSettingIdNow]);

    return (
        <div className="min-w-[800px]">
            <div className="flex flex-row w-full">
                <div className="flex-grow self-end align-end">
                    <h1>Law Collector</h1>
                    <label>한국 법령정보 수집기</label>
                </div>
                <div className="flex">
                    <button className="w-[70px] h-[25px] self-end align-end element-button" onClick={showSettingIdField}> Id 설정</button>
                    {isSettingIdNow && <input type="text" className='w-[120px] h-[20px] ml-1 self-end align-end element-input-text' id="api-id" ref={inputRef} />}
                    {isSettingIdNow && <button className="w-[50px] h-[25px] ml-1 self-end align-end element-button" onClick={handleSetApiId}>저장</button>}
                </div>
            </div>
            <hr className="element-hr-style1" />
            {/* <div className='w-full flex flex-row'>
                <div className='flex-grow'>
                    <input className='w-[100%] h-[22px] element-input-text'></input>
                </div>
                <div className=''>
                    <button className='w-[50px] h-[25px] ml-3'>검색</button>
                </div>
            </div> */}
        </div>
    );
}
