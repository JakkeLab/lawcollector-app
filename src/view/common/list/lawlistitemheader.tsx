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

export const LawListHeader: React.FC<LawListItemProps> = ({ dimensions, lawName, lawCode, checkHandler }) => {
    return (
        <div className="flex flex-row">
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
    );
};
