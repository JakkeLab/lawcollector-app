export interface ILawTree {
    ParentLaw : ILawTree | null,
    ChildLaw : Map<number, ILawTree>,
    HanjungRules : Map<number, ILawHanjung>,
    JachiLaw : Map<number, ILawJachi>,
    Bonmun? : ILawBonmun;
    LawInfo : ILawHeader;
    LawType: string;
}

export interface ILawHanjung {
    LawInfo: ILawHeader,
    RuleType: string,
    Revision? : string,
    Bonmun? : ILawBonmun
}

export interface ILawJachi {
    LawInfo: ILawHeader,
    RuleType: string,
    Revision : string,
    Bonmun? : ILawBonmun,
}

export interface ILawHeader {
    Id: number,
    StartDate : number,
    LawTitle : string,
}

export interface ILawBonmun {
    Jomuns : Map<number, ILawJomun>,
    Buchicks : Map<number, ILawBuchick>,
    Amend : ILawAmend | null,
    AmendReson : ILawAmendReason | null,
}

export interface ILawJomun {
    Index: number,
    Title: string,
    StartDate: number,
    Content: string,
    Hangs: Map<number, ILawHang>
}

export interface ILawAmend {
    Content : string,
}

export interface ILawAmendReason {
    Content : string,
}

export interface ILawHang {
    Index : number,
    Content : string,
}

export interface ILawBuchick {
    Id : number,
    DeclareDate : number,
    DeclareNumber : number,
    Content : string,
}

/* Class */
export class LawHeader implements ILawHeader {
    Id: number = -1;
    StartDate : number = -1;
    LawTitle : string = "";

    private constructor(){
        
    }

    static CreateEmptyHeader(){
        return new LawHeader();
    }
}

export class LawTree implements ILawTree {
    ParentLaw: ILawTree | null = null;
    ChildLaw: Map<number, ILawTree> = new Map<number, ILawTree>();
    HanjungRules: Map<number, ILawHanjung> = new Map<number, ILawHanjung>();
    JachiLaw: Map<number, ILawJachi> = new Map<number, ILawJachi>();
    Bonmun?: ILawBonmun | undefined;
    LawInfo: ILawHeader = LawHeader.CreateEmptyHeader();
    LawType: string = "";
    private constructor(){
        
    }

    static CreateEmptyTree(){
        return new LawTree();
    }
}

export class LawHanjung implements ILawHanjung {
    LawInfo: ILawHeader = LawHeader.CreateEmptyHeader();
    RuleType: string = "";
    Revision?: string;
    Bonmun?: ILawBonmun;

    private constructor() {
        
    }

    static CreateEmptyHanjung() {
        return new LawHanjung();
    }
}