import React from 'react';

interface LawListItemProps {
    dimensions: {
        widthCb: number;
        widthLawCode: number;
    };
    lawName: string;
    lawCode: string;
    checkHandler: () => void;
}

export const LawListItem: React.FC<LawListItemProps> = ({ dimensions, lawName, lawCode, checkHandler }) => {    
    return (
        <div>
            <div className={`flex flex-row items-center`}>
                <div style={{ width: dimensions.widthCb }}>
                    <input type="checkbox" onChange={checkHandler} />
                </div>
                <div style={{ flexGrow: 1 }}>
                    {lawName}
                </div>
                <div style={{ width: dimensions.widthLawCode }} className='text-end'>
                    {lawCode}
                </div>
            </div>
            <hr className='element-hr-style2'/>
        </div>

    );
};
