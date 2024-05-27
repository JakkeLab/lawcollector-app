import StatusBlock from "./statusblock";
import { IStatus } from "@/type/statusblockarg";

interface StatusStackProps {
    statusList: IStatus[];
    removeStatusHandler: (index: number) => void;
  }

  export default function StatusStack({ statusList, removeStatusHandler }: StatusStackProps) {
    return (
      <div className="flex flex-col service-status-stack">
        {statusList.map((stat, index) => (
          <StatusBlock
            key={index}
            message={stat.content}
            isAlert={stat.isAlert}
            onClose={() => removeStatusHandler(index)}
          />
        ))}
      </div>
    );
  }