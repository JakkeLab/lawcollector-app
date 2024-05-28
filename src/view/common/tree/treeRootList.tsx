import { ILawTree } from "@/model/lawmodel";
import TreeRoot from "./treeRoot";
import { useState } from "react";

export default function TreeRootList({
    trees, removeHandler, checkStateSender }: {
        trees: Map<ILawTree, boolean>, removeHandler: (node: ILawTree) => void, checkStateSender: (arg: { node: ILawTree, isChecked: boolean }) => void}) {
    
    const checkStateSend = (node: ILawTree, isChecked: boolean) => {
        const checkStateArg = {
            node,
            isChecked
        };
        checkStateSender(checkStateArg);
    }
    
    const treeRootElements = Array.from(trees).map((tree) => {
        const treeNode = tree[0];
        const checkState = tree[1];
        return <TreeRoot tree={treeNode} removeHandler={() => removeHandler(treeNode)} checkHandler={checkStateSend} isChecked={checkState}/>
    })

    return (
        <div className="w-full flex flex-col">
            {treeRootElements}
        </div>
    )
}