import { ILawTree } from "@/model/lawmodel";
import '../../index.css'
import { ChangeEvent } from "react";

export default function ExportItem(
    {tree, isChecked, removeHandler, checkHandler}:
    {tree:ILawTree, isChecked:boolean, removeHandler:() => void, checkHandler: (node: ILawTree, isChecked: boolean) => void}) {

    const checkStateSender = (e: ChangeEvent<HTMLInputElement>) => {
        checkHandler(tree, e.target.checked);
    }

    return (
        <div className="flex flex-col h-[52px]">
            <div className="flex flex-row">
                <div className="">
                    <input type="checkbox" onChange={checkStateSender} id="node-cb" checked={isChecked}/>
                </div>
                <div className="ml-1 flex-grow">
                    {tree.LawInfo.LawTitle}
                </div>
                <div className="mr-1">
                    <button className="btn-remove" onClick={removeHandler}>✕</button>
                </div>
            </div>
            <hr className="w-full"/>
        </div>
    )
}