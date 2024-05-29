import { ChangeEvent, useState } from "react"
import LawListSearchBox from "../../search/lawlistsearchbox";
import LawListSearchResult from "../../search/lawlistsearchresult";
import { ILawSearched, ILawSearchResult, ILaw } from "@/lib/apiquery";
import LawListHeader from "./lawlistitemheader";
import { ILawListItemProps } from "./lawlistitemprop";
import LawListSelected from "@/view/search/lawlistselected";
import { ILawTree } from "@/model/lawmodel";
import TreeRootList from "../tree/treeRootList";
import ExportItemList from "@/view/exportitems/exportitemlist";
import { PDFApi } from "@/lib/exportAsPdf";

export default function LawList({fileLoadHander, fileSaveStateHandler}:
    {fileLoadHander:(arg:{isLoaded:boolean, reason?:string}) => void, fileSaveStateHandler:(arg:{ isExported: boolean, reason?: string;}) => void}) {
    const [currentFilName, setFileName] = useState('');
    const [searchedLaws, setSearchedLaws] = useState<ILawSearched[]>([]);
    const [selectedLaws, setSelectedLaws] = useState<Map<number, ILaw>>(new Map<number, ILaw>());
    const [checkStates, changeCheckStates] = useState<Map<ILawTree, boolean>>(new Map<ILawTree, boolean>());
    const [contentAttachedTrees, setContentAttachedLaws] = useState<Map<ILawTree, boolean>>(new Map<ILawTree, boolean>());
    
    //#region UI Controls
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

    const removeTreeHandler = (node:ILawTree) => {
        const updatedNodes = new Map<ILawTree, boolean>(checkStates);
        updatedNodes.delete(node);
        changeCheckStates(updatedNodes);
    }

    const removeExportItemHandler = (node:ILawTree) => {
        const updatedNodes = new Map<ILawTree, boolean>(contentAttachedTrees);
        updatedNodes.delete(node);
        setContentAttachedLaws(updatedNodes);
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

    const updateCheckedRootTrees = (arg: { node: ILawTree, isChecked: boolean }) => {
        const updatedStates = new Map<ILawTree, boolean>(checkStates)
        if(arg.isChecked) {
            updatedStates.set(arg.node, arg.isChecked);
            changeCheckStates(updatedStates);
        } else {
            updatedStates.set(arg.node, arg.isChecked);
            changeCheckStates(updatedStates);
        }
        console.log(`Law ID ${arg.node.LawInfo.Id} is ${arg.isChecked ? "checked" : "unchecked"}`)
        console.log(updatedStates);
    }

    const updateCheckedExportItems = (arg: { node: ILawTree, isChecked: boolean }) => {
        const updatedStates = new Map<ILawTree, boolean>(contentAttachedTrees)
        if(arg.isChecked) {
            updatedStates.set(arg.node, arg.isChecked);
            setContentAttachedLaws(updatedStates);
        } else {
            updatedStates.set(arg.node, arg.isChecked);
            setContentAttachedLaws(updatedStates);
        }
        console.log(`Law ID ${arg.node.LawInfo.Id} is ${arg.isChecked ? "checked" : "unchecked"}`)
        console.log(updatedStates);
    }

    const handleAllCheckbox = (e:ChangeEvent<HTMLInputElement>) => {
        const checkState = e.target.checked;
        const updatedStates = new Map<ILawTree, boolean>(checkStates);
        Array.from(updatedStates).forEach((item) => {
            updatedStates.set(item[0], checkState);
        });
        changeCheckStates(updatedStates);
        console.log(updatedStates);
    }

    const handleAllCheckboxExportItems = (e:ChangeEvent<HTMLInputElement>) => {
        const checkState = e.target.checked;
        const updatedStates = new Map<ILawTree, boolean>(contentAttachedTrees);
        Array.from(updatedStates).forEach((item) => {
            updatedStates.set(item[0], checkState);
        });
        setContentAttachedLaws(updatedStates);
        console.log(updatedStates);
    }
    
    const exportPdfHandler = async () => {
        const trees = Array.from(contentAttachedTrees.keys());
        const treeSet = new Set<ILawTree>(trees);

        const folderResult = await window.electronAPI.selecFolder();
        if (!folderResult || folderResult === "") {
            console.log('Folder selection was canceled');
            return;
        }
        
        const res = await window.electronAPI.exportMultipleContent(treeSet);
        const lawContents = await Promise.all(res);

        // Blob 형태로 PDF 생성 및 Base64 문자열로 변환
        const pdfBuffers = await Promise.all(lawContents.map(async (lawContent) => {
            const blob = await PDFApi.generatePdfBlob(lawContent);
            const arrayBuffer = await blob.arrayBuffer();
            const base64String = arrayBufferToBase64(arrayBuffer);
            return {
                base64: base64String,
                rootLawName: lawContent.rootLawName
            };
        }));
        
        // Base64 문자열을 메인 프로세스로 전송하여 파일 저장
        const saveResult = await window.electronAPI.savePdfs({
            pdfBuffers,
            folderPath: folderResult
        });

        if(saveResult && saveResult == 'Success'){
            fileSaveStateHandler({isExported:true})
        }
    }

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    //#endregion

    //#region DataFetch
    const fetchLawStructure = async () => {
        console.log('트리검색');
        const lawIds = Array.from(selectedLaws.keys());
    
        const promises = lawIds.map(async (id) => {
            const res = await window.electronAPI.fetchLawStructure(id);
            if (!res) {
                console.log("Fetch Undefined");
                return;
            }
            if (res.result && res.lawTree) {
                console.log("Succeeded");
                console.log(res.lawTree);
                return res.lawTree;
            } else {
                console.log("Failed");
            }
        });
    
        const results = await Promise.all(promises);
    
        // 상태 업데이트를 함수 기반으로 처리합니다.
        changeCheckStates(prevState => {
            const newState = new Map(prevState);
            results.forEach(lawTree => {
                if (lawTree) {
                    newState.set(lawTree, false);
                }
            });
            return newState;
        });
    };

    const fetchLawContent = async () => {
        let itemsToFetch: Set<ILawTree> = new Set<ILawTree>();

        // Collect all items that need to be fetched
        checkStates.forEach((value, key) => {
            if (value) {
                itemsToFetch.add(key);
            }
        });

        // Fetch all content in parallel
        const fetchPromises = Array.from(itemsToFetch).map(async (tree) => {
            return window.electronAPI.fetchLawContent(tree);
        });

        // Wait for all fetches to complete
        const fetchedTrees = await Promise.all(fetchPromises);

        // Update state with the fetched content
        const updatedTrees = new Map<ILawTree, boolean>(contentAttachedTrees);
        fetchedTrees.forEach((updatedTree) => {
            if (updatedTree) {
                updatedTrees.set(updatedTree, false);
            } else {
                console.log("No Updated Trees");
            }
        });

        setContentAttachedLaws(updatedTrees);
        console.log("Trees Updated");
    };
    //#endregion

    //#region Pre-created Elements
    const treeRootElements = <TreeRootList trees={checkStates} removeHandler={removeTreeHandler} checkStateSender={updateCheckedRootTrees}/>
    const exportItemElements = <ExportItemList trees={contentAttachedTrees} removeHandler={removeExportItemHandler} checkStateSender={updateCheckedExportItems}/>
    //#endregion

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
                    <button onClick={fetchLawStructure}>트리검색</button>
                </div>
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
            <div>
                <LawListSelected selectedLaws={selectedLaws} clickHandler={removeSelectedItem}/> 
            </div>
            <hr className='element-hr-style1 w-[100%]'/>
        </div>
        <div className="w-[300px] ml-2 flex flex-col">
            <div className="flex flex-col">
                <div className="flex flex-row flex-grow h-[25px]">
                    <div className='flex-grow align-center self-center'>
                        최상위법 리스트
                    </div>
                </div>
                <hr className='element-hr-style2 w-[100%]'/>
                <div className="flex flex-row flex-grow h-[25px]">
                    <div className='flex-grow align-center self-center'>
                        <input type="checkbox" onChange={handleAllCheckbox}/> 전체선택
                    </div>
                    <div className='self-end'>
                        <button onClick={fetchLawContent}>본문수집</button>
                    </div>
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
                <div className='h-[743px]'>
                    {treeRootElements}
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
            </div>
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
                        <input type="checkbox" onChange={handleAllCheckboxExportItems}/> 전체선택
                    </div>
                    <div className='self-end'>
                        <button onClick={exportPdfHandler}>PDF 내보내기</button>
                    </div>
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
                <div className='h-[743px]'>
                    {exportItemElements}
                </div>
                <hr className='element-hr-style1 w-[100%]'/>
            </div>
        </div>
      </div>
    )
}

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
    throw new Error("Function not implemented.");
}
