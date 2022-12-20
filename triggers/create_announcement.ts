import { Trigger } from "deno-slack-api/types.ts";
import createAnnouncement from "../workflows/create_announcement.ts";

const trigger: Trigger<
  typeof createAnnouncement.definition
> = {
  type: "shortcut",
  name: "Create an announcement",
  description:
    "Create and send an announcement to one or more channels in your workspace.",
  workflow: "#/workflows/create_announcement",
  inputs: {
    created_by: {
      value: "{{data.user_id}}",
    },
    interactivity: {
      value: "{{data.interactivity}}",
    },
  },
};

export default trigger;
