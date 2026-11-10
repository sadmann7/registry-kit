import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/registry/bases/base/ui/announcement";

export default function AnnouncementDemo() {
  return (
    <Announcement render={<a href="#rating" />}>
      <AnnouncementTag>New</AnnouncementTag>
      <AnnouncementTitle>Rating joined the registry</AnnouncementTitle>
    </Announcement>
  );
}
