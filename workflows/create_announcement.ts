import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { createDraft } from "../functions/create_draft.ts";
import { postSummary } from "../functions/post_summary.ts";
import { sendAnnouncement } from "../functions/send_announcement.ts";

const createAnnouncement = DefineWorkflow({
  callback_id: "create_announcement",
  title: "Create an announcement",
  description:
    "Create and send an announcement to one or more channels in your workspace.",
  input_parameters: {
    properties: {
      created_by: {
        type: Schema.slack.types.user_id,
      },
      interactivity: {
        type: Schema.slack.types.interactivity,
      },
    },
    required: ["created_by", "interactivity"],
  },
});

const form = createAnnouncement
  .addStep(Schema.slack.functions.OpenForm, {
    title: "Create an announcement",
    description:
      "Create a draft announcement. You will have the opportunity to preview & edit it in channel before sending.\n\n_Want to create a richer announcement? Use <https://app.slack.com/block-kit-builder|Block Kit Builder> and paste the full payload into the message input below._",
    interactivity: createAnnouncement.inputs.interactivity,
    submit_label: "Preview",
    fields: {
      elements: [{
        name: "message",
        title: "Message",
        type: Schema.types.string,
        description: "Compose your message using plain text, mrkdwn, or blocks",
        long: true,
      }, {
        name: "channels",
        title: "Destination channels",
        type: Schema.types.array,
        items: {
          type: Schema.slack.types.channel_id,
        },
        description: "The channels where your announcement will be posted",
      }, {
        name: "channel",
        title: "Draft channel",
        type: Schema.slack.types.channel_id,
        description:
          "The channel where you and your team can preview & edit the announcement before sending",
      }, {
        name: "icon",
        title: "Custom emoji icon",
        type: Schema.types.string,
        description:
          "Emoji to override the default app icon. Must use the format &colon;robot_face&colon; to be applied correctly.",
      }, {
        name: "username",
        title: "Custom username",
        type: Schema.types.string,
        description: "Name to override the default app name",
      }],
      required: ["message", "channels", "channel"],
    },
  });

const draft = createAnnouncement.addStep(createDraft, {
  created_by: createAnnouncement.inputs.created_by,
  message: form.outputs.fields.message,
  channels: form.outputs.fields.channels,
  channel: form.outputs.fields.channel,
  icon: form.outputs.fields.icon,
  username: form.outputs.fields.username,
});

const send = createAnnouncement.addStep(sendAnnouncement, {
  message: draft.outputs.message,
  channels: form.outputs.fields.channels,
  icon: form.outputs.fields.icon,
  username: form.outputs.fields.username,
  draftId: draft.outputs.draftId,
});

createAnnouncement.addStep(postSummary, {
  announcements: send.outputs.announcements,
  channel: form.outputs.fields.channel,
  message_ts: draft.outputs.message_ts,
});

export default createAnnouncement;
