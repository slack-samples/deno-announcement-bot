import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

const announcements = DefineDatastore({
  name: "announcements",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    draft_id: {
      type: Schema.types.string,
    },
    success: {
      type: Schema.types.boolean,
    },
    error_message: {
      type: Schema.types.string,
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    message_ts: {
      type: Schema.types.string,
    },
  },
});

export default announcements;
