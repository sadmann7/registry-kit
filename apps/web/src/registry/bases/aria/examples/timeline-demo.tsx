import { formatDate } from "@/registry/bases/aria/lib/format";
import {
  Timeline,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/registry/bases/aria/ui/timeline";

const events = [
  {
    date: "2026-11-03",
    title: "Registry created",
    description: "Scaffolded with Better-T-Stack.",
  },
  {
    date: "2026-11-07",
    title: "First item published",
    description: "Built for every base and style.",
  },
  {
    date: "2026-11-11",
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
          <TimelineTime dateTime={event.date}>
            {formatDate(event.date, {
              month: "short",
              year: undefined,
            })}
          </TimelineTime>
          <TimelineTitle>{event.title}</TimelineTitle>
          <TimelineDescription>{event.description}</TimelineDescription>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
