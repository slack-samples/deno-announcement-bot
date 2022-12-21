import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

/**
 * Datastores are a Slack-hosted location to store
 * and retrieve data for your app.
 * https://api.slack.com/future/datastores
 */
export default DefineDatastore({
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
      type: Schema.types.string, // possible statuses are draft, sent
    },
  },
});
