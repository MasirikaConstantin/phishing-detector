import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { RiskLevel } from "@/lib/types";
import { riskLabel } from "@/lib/format";

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <Badge variant={level}>{riskLabel(level)}</Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent>Niveau de risque calculé par le moteur heuristique.</TooltipContent>
    </Tooltip>
  );
}
