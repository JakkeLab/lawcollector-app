export default function StatusBlock({message, isAlert}:{message:string, isAlert:boolean}) {
    let componentClassString:string = "w-[200px] h-[50px]";
    
    if(isAlert) {
        componentClassString += " status-alert"
    } else {
        componentClassString += " status-ok"
    }
    return (
        <div className={componentClassString}>
            {message}
            <button>✕</button>
        </div>
    )
}