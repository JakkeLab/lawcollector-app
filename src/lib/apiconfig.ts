class LawAPIConfig {
    private _apiId:string;
    
    constructor(){
        this._apiId="";
    }

    getCurrentId(){
        return this._apiId;
    }

    setCurrentId(id:string){
        this._apiId = id;
    }
}

export { LawAPIConfig };