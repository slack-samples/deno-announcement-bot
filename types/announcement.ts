import { DefineType, Schema } from "deno-slack-sdk/mod.ts";

const Announcement = DefineType({
  name: "Announcement",
  type: Schema.types.object,
  properties: {
    channel_id: {
      type: Schema.slack.types.channel_id,
    },
    success: {
      type: Schema.types.boolean,
    },
    permalink: {
      type: Schema.types.string,
    },
    error: {
      type: Schema.types.string,
    },
  },
  required: ["channel_id", "success"],
});

export default Announcement;
