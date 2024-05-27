import { ILaw, ILawSearched } from "@/lib/apiquery";
import { ILawListItemProps } from "../common/list/lawlistitemprop";
import LawListItem from "../common/list/lawlistitem";
import { MouseEvent } from "react";
import '../../index.css';


export default function LawListSelected({selectedLaws, clickHandler} : {selectedLaws:Map<number, ILaw>, clickHandler:(id:number) => void}){
    const laws = Array.from(selectedLaws.values());
    const items = laws.map(law => {
        return (<LawListItem law={law} isAddItems={false} clickHandler={() => clickHandler(law.lawId)} />)
    })

    return (
        <div className="flex flex-col h-[300px] element-scrollable-div">
            {items}
        </div>
    );
}