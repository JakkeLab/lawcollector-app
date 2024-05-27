import { ChangeEvent, useState } from "react"
import LawListSearchBox from "../../search/lawlistsearchbox";
import LawListSearchResult from "../../search/lawlistsearchresult";
import { ILawSearched, ILawSearchResult, ILaw } from "@/lib/apiquery";
import LawListHeader from "./lawlistitemheader";
import { ILawListItemProps } from "./lawlistitemprop";
import LawListSelected from "@/view/search/lawlistselected";

export default function LawList({fileLoadHander}:{fileLoadHander:(arg:{isLoaded:boolean, reason?:string}) => void}) {
    const [currentFilName, setFileName] = useState('');
    const [searchedLaws, setSearchedLaws] = useState<ILawSearched[]>([]);
    const [selectedLaws, setSelectedLaws] = useState<Map<number, ILaw>>(new Map<number, ILaw>());
    const widthSet:ILawListItemProps = {
        dimensions: {
            widthCb: 30,
            widthLawCode: 80,
        },
    }

    const refreshLawList = () => {
        window.electronAPI.getLawListFromFlie().then((res) => {
            if(res.loaded){
                console.log(res.laws);
                setFileName(res.filename);
                fileLoadHander({isLoaded:true});
            } else {
                console.log(res.reason);
                fileLoadHander({isLoaded:false, reason:res.reason});
            }
        })
    }
    
    const addSearchedItem = (law:ILaw) => {
        const lawMap = new Map(selectedLaws);
        lawMap.set(law.lawId, law);
        setSelectedLaws(lawMap);
    }

    const removeSelectedItem = (id:number) => {
        const lawMap = new Map(selectedLaws);
        lawMap.delete(id);
        setSelectedLaws(lawMap);
    }

    const searchModeHandler = (searchString:string) => {
        if(searchString.length == 0){
            alert('텍스트를 입력후 검색해 주세요.')
        } else {
            console.log(searchString);
            window.electronAPI.searchLawByString(searchString).then((res) => {
                if(res.result && res.laws) {
                    const searchedLaws = Array.from(res.laws.values());
                    setSearchedLaws(searchedLaws);
                } else {
                    console.error(res.reason);
                }
            });
        }
    } 

    const fetchLawStructure = () => {
        const testLaw = Array.from(selectedLaws)[0];
        const testLawId = testLaw[0];
        window.electronAPI.fetchLawStructure(testLawId);
    }

    return (
    <div className='flex flex-row w-full mt-2'>
        <div className='flex flex-col w-[400px]'>
            <div className='flex flex-row items-center h-[25px]'>
                <div className='flex-grow align-center self-center'>
                    법률 리스트
                </div>
                <div>
                    <button className='element-button w-[70px] place-content-end' onClick={refreshLawList}>가져오기</button>
                </div>
            </div>
            <hr className='element-hr-style2 w-[100%]'/>
            <div className='flex flex-row items-center h-[25px]'>
                <div className='flex-grow align-center self-center'>
                    파일
                </div>
                <div>
                    {currentFilName}
                </div>
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
            <div>
                <LawListSearchBox searchTextHandler={searchModeHandler}/>
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
            <div className="items-center w-[100%]">
                <LawListHeader listItemProps={widthSet}/>
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
            <div>
                <LawListSearchResult searchedLaws={searchedLaws} checkHandler={addSearchedItem} /> 
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
            <div className="flex flex-row">
                <div className='flex-grow align-center self-center'>
                    선택된 법률명
                </div>
                <div>
                    <button onClick={fetchLawStructure}>검색하기</button>
                </div>
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
            <div>
                <LawListSelected selectedLaws={selectedLaws} clickHandler={removeSelectedItem}/> 
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
        </div>
        <div className='flex-grow ml-2'>
            <div className="flex flex-col">
                <div className="flex flex-row flex-grow h-[25px]">
                    <div className='flex-grow align-center self-center'>
                        검색결과
                    </div>
                </div>
                <hr className='element-hr-style2 w-[100%]'/>
                <div className="flex flex-row flex-grow h-[25px]">
                    <div className='flex-grow align-center self-center'>
                        <input type="checkbox"/> 전체선택
                    </div>
                    <div className='self-end mr-2'>
                        <button>XML 내보내기</button>
                    </div>
                    <div className='self-end'>
                        <button>PDF 내보내기</button>
                    </div>
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
                <div className='h-[743px]'>

                </div>
                <hr className='element-hr-style1 w-[100%]'/>
            </div>
        </div>
      </div>
    )
}