import { Trigger } from "deno-slack-sdk/types.ts";
import CreateAnnouncementWorkflow from "../workflows/create_announcement.ts";

/**
 * This is a definition file for a shortcut link trigger
 * For more on triggers and other trigger types:
 * https://api.slack.com/automation/triggers
 */
const trigger: Trigger<
  typeof CreateAnnouncementWorkflow.definition
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
