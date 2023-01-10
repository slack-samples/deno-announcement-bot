import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/future/datastores
 */
export default DefineDatastore({
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
