import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

const drafts = DefineDatastore({
  name: "drafts",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    created_by: {
      type: Schema.slack.types.user_id,
    },
    message: {
      type: Schema.types.string,
    },
    channels: {
      type: Schema.types.array,
      items: {
        type: Schema.slack.types.channel_id,
      },
    },
    channel: {
      type: Schema.slack.types.channel_id,
    },
    message_ts: {
      type: Schema.types.string,
    },
    icon: {
      type: Schema.types.string,
    },
    username: {
      type: Schema.types.string,
    },
    status: {
      type: Schema.types.string, // draft, sent
    },
  },
});

export default drafts;
