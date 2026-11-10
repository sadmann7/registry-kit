import {
  Timeline,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/registry/bases/radix/ui/timeline";

const events = [
  { time: "Nov 3", title: "Registry created", description: "Scaffolded with Better-T-Stack." },
  { time: "Nov 7", title: "First item published", description: "Built for every base and style." },
  {
    time: "Nov 11",
    title: "Installed in an RTL project",
    description: "The CLI flipped the classes on install.",
  },
];

export default function TimelineDemo() {
  return (
    <Timeline>
      {events.map((event) => (
        <TimelineItem key={event.title}>
          <TimelineDot />
          <TimelineTime>{event.time}</TimelineTime>
          <TimelineTitle>{event.title}</TimelineTitle>
          <TimelineDescription>{event.description}</TimelineDescription>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
