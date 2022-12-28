import { Manifest } from "deno-slack-sdk/mod.ts";
import AnnouncementDatastore from "./datastores/announcements.ts";
import DraftDatastore from "./datastores/drafts.ts";
import { AnnouncementCustomType } from "./functions/post_summary/types.ts";
import createAnnouncement from "./workflows/create_announcement.ts";

export default Manifest({
  name: "Announcement Bot",
  description: "Send an announcement to one or more channels",
  icon: "assets/icon.png",
  outgoingDomains: ["cdn.skypack.dev"],
  datastores: [DraftDatastore, AnnouncementDatastore],
  types: [AnnouncementCustomType],
  workflows: [
    createAnnouncement,
  ],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "chat:write.customize",
    "datastore:read",
    "datastore:write",
  ],
});
