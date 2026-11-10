import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/registry/bases/radix/ui/announcement";

export default function AnnouncementDemo() {
  return (
    <Announcement asChild>
      <a href="#rating">
        <AnnouncementTag>New</AnnouncementTag>
        <AnnouncementTitle>Rating joined the registry</AnnouncementTitle>
      </a>
    </Announcement>
  );
}
