import { Manifest } from "deno-slack-sdk/mod.ts";
import announcements from "./datastores/announcements.ts";
import drafts from "./datastores/drafts.ts";
import Announcement from "./types/announcement.ts";
import createAnnouncement from "./workflows/create_announcement.ts";

export default Manifest({
  name: "Announcement Bot",
  description: "Send an announcement to one or more channels",
  icon: "assets/icon.png",
  outgoingDomains: [],
  datastores: [drafts, announcements],
  types: [Announcement],
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
