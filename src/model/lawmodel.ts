export interface ILawTree {
    ParentLaw : ILawTree | null,
    ChildLaw : Map<number, ILawTree>,
    HanjungRules : Map<number, ILawHanjung>,
    JachiLaw : Map<number, ILawJachi>,
    Content? : string;
    LawInfo : ILawHeader;
    LawType: string;
    GetNodesBFS(nodes:ILawTree[]):void;
}

export interface ILawHanjung {
    LawInfo: ILawHeader,
    RuleType: string,
    Revision? : string,
    Content? : string
}

export interface ILawJachi {
    LawInfo: ILawHeader,
    RuleType: string,
    Revision : string,
    Bonmun? : ILawContent,
}

export interface ILawHeader {
    Id: number,
    StartDate : number,
    LawTitle : string,
}

export interface ILawContent {
    Jomuns : Map<number, ILawJomun>,
    Buchicks : Map<number, ILawBuchick>,
    Amend? : ILawAmend,
    AmendReson? : ILawAmendReason,
}

export interface ILawBuchick {
    Id : number,
    DeclareDate : number,
    DeclareNumber : number,
    Content : string,
}

export interface ILawAmend {
    Content : string,
}

export interface ILawAmendReason {
    Content : string,
}

export interface ILawJo {
    Index: number;
    Title?: string;
    StartDate: number;
    Content: string;
    Hangs? : Map<number, ILawHang>;
}

export interface ILawJeonmun {
    
}

export interface ILawJomun {
    
}

export interface ILawHang {
    Index : number;
    Content : string;
    Hos? : Map<number, ILawHo>;
}

export interface ILawHo {
    Index : number;
    Content : string;
    Moks? : Map<number, ILawMok>;
}

export interface ILawMok {
    Index : number;
    Content : string;
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
    Content?: string;
    LawInfo: ILawHeader = LawHeader.CreateEmptyHeader();
    LawType: string = "";
    private constructor(){
        
    }

    static CreateEmptyTree(){
        return new LawTree();
    }

    GetNodesBFS(lawNodes: ILawTree[]): void {
        const queue: ILawTree[] = [];
        queue.push(this); // 루트 노드를 큐에 추가
        
        while (queue.length > 0) {
            const currentNode = queue.shift(); // 큐에서 노드를 하나 꺼냄

            if (currentNode) {
                lawNodes.push(currentNode); // 현재 노드를 결과 배열에 추가

                // 현재 노드의 자식 노드들을 큐에 추가
                currentNode.ChildLaw.forEach((childNode) => {
                    queue.push(childNode);
                });
            }
        }
    }
}

export class LawHanjung implements ILawHanjung {
    LawInfo: ILawHeader = LawHeader.CreateEmptyHeader();
    RuleType: string = "";
    Revision?: string;
    Bonmun?: string;

    private constructor() {
        
    }

    static CreateEmptyHanjung() {
        return new LawHanjung();
    }
}

export class LawJomun implements ILawJo{
    Index: number;
    Title?: string;
    StartDate: number;
    Content: string;
    Hangs: Map<number, ILawHang>;

    private constructor(){
        this.Index = -1;
        this.Title = "",
        this.StartDate = -1;
        this.Content = "";
        this.Hangs = new Map<number, ILawHang>();
    }

    static CreateEmptyJomun(){
        return new LawJomun();
    }
    
}

export class LawHang implements ILawHang{
    Index: number;
    Content: string;

    private constructor() {
        this.Index = -1;
        this.Content = "";
    }

    static CreateEmptyHang(){
        return new LawHang();
    }
}

export class LawBuchick implements ILawBuchick {
    Id: number;
    DeclareDate: number;
    DeclareNumber: number;
    Content: string;   
    
    private constructor() {
        this.Id = -1;
        this.DeclareDate = -1;
        this.DeclareNumber = -1;
        this.Content = "";
    }

    static CreateEmptyBuchick() {

    }
}

export class LawAmend implements ILawAmend {
    Content: string;
    
    private constructor() {
        this.Content = "";
    }

    static CreateEmptyAmend(){
        return new LawAmend();
    }

}

export class LawAmendReason implements ILawAmendReason {
    Content: string;

    private constructor(){
        this.Content = "";
    }

    static CreateEmptyAmendReason(){
        return new LawAmendReason();
    }
    
}

export class LawContent implements ILawContent {
    Jomuns: Map<number, ILawJomun>;
    Buchicks: Map<number, ILawBuchick>;
    Amend?: ILawAmend;
    AmendReson?: ILawAmendReason;

    private constructor() {
        this.Jomuns = new Map<number, ILawJomun>();
        this.Buchicks = new Map<number, ILawBuchick>();
    }

    static CreateEmptyContent(){
        return new LawContent();
    }
}