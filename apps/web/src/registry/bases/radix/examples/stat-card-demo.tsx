import {
  StatCard,
  StatCardCaption,
  StatCardDelta,
  StatCardHeader,
  StatCardLabel,
  StatCardSparkline,
  StatCardValue,
} from "@/registry/bases/radix/ui/stat-card";

const stats = [
  {
    label: "Revenue",
    value: "$48,210",
    delta: "12.4%",
    caption: "vs. $42,890 last month",
    data: [14, 18, 12, 20, 16, 24, 19, 26, 22, 28, 25, 30],
  },
  {
    label: "Active users",
    value: "2,184",
    delta: "3.1%",
    caption: "vs. 2,118 last month",
    data: [20, 22, 19, 24, 21, 23, 26, 22, 25, 27, 24, 28],
  },
];

export default function StatCardDemo() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} className="w-65">
          <StatCardHeader>
            <StatCardLabel>{stat.label}</StatCardLabel>
            <StatCardDelta>{stat.delta}</StatCardDelta>
          </StatCardHeader>
          <StatCardValue>{stat.value}</StatCardValue>
          <StatCardCaption>{stat.caption}</StatCardCaption>
          <StatCardSparkline data={stat.data} />
        </StatCard>
      ))}
    </div>
  );
}
