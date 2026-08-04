import { Layer, Rectangle, ResponsiveContainer, Sankey, Tooltip } from "recharts";
import type { MoneyFlowData } from "@/types/banking";

interface NodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; color: string; value?: number };
}

function CustomNode({ x, y, width, height, payload }: NodeProps) {
  const isLeftEdge = x < 40;
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={height} fill={payload.color} fillOpacity={0.9} />
      <text
        x={isLeftEdge ? x - 8 : x + width + 8}
        y={y + height / 2}
        textAnchor={isLeftEdge ? "end" : "start"}
        dominantBaseline="middle"
        fontSize={11}
        fill="#eaf1fb"
      >
        {payload.name}
      </text>
    </Layer>
  );
}

export default function MoneyFlowSankey({ data }: { data: MoneyFlowData }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={data}
          node={CustomNode as any}
          nodePadding={22}
          nodeWidth={10}
          link={{ stroke: "#33d6ac", strokeOpacity: 0.18 }}
          margin={{ top: 8, bottom: 8, left: 90, right: 90 }}
        >
          <Tooltip
            contentStyle={{
              background: "#0f1c30",
              border: "1px solid #1e3252",
              borderRadius: 12,
              color: "#eaf1fb",
              fontSize: 12,
            }}
            itemStyle={{ color: "#eaf1fb" }}
            labelStyle={{ color: "#eaf1fb" }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, "Amount"]}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}