import {
  AnnouncementLink,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/registry/bases/aria/ui/announcement";

export default function AnnouncementDemo() {
  return (
    <AnnouncementLink href="#rating">
      <AnnouncementTag>New</AnnouncementTag>
      <AnnouncementTitle>Rating joined the registry</AnnouncementTitle>
    </AnnouncementLink>
  );
}
