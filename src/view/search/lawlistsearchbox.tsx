import { MouseEvent } from "react"
import '../../index.css';

export default function LawListSearchBox({searchTextHandler}:{searchTextHandler:(text:string) => void}) {
    const inputChangeHandler = (e:MouseEvent<HTMLButtonElement>) => {
        const inputElement = document.getElementById('lawlist-input') as HTMLInputElement;
        if(inputElement) searchTextHandler(inputElement.value);
    }
    
    return (
        <div className="flex flex-col">
            <div className="flex flex-row align-middle content-center items-center">
                <div className="mr-2">
                    검색
                </div>
                <div className="flex-grow mr-3">
                    <input type="text" placeholder="여기에 법령 입력.." className="w-full element-input-style1" id="lawlist-input"/>
                </div>
                <div>
                    <button className="w-[40px] element-button" onClick={inputChangeHandler}>검색</button>
                </div>
            </div>
        </div>
    )
}