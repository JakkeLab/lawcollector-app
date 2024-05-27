import { ILaw, ILawSearched } from "@/lib/apiquery";
import { ILawListItemProps } from "../common/list/lawlistitemprop";
import LawListItem from "../common/list/lawlistitem";
import { ChangeEvent } from "react";
import '../../index.css';

export default function LawListSearchResult({searchedLaws, checkHandler} : {searchedLaws:ILawSearched[], checkHandler:(law:ILaw) => void}){

    const items = searchedLaws.map((law) => {
        return <LawListItem 
            law={law.lawData} 
            isAddItems={true}
            clickHandler={() => checkHandler(law.lawData)} 
        />
    });

    return (
        <div className="flex flex-col h-[300px] element-scrollable-div">
            {items}
        </div>
    );
}