import { SlackFunction } from "deno-slack-sdk/mod.ts";

import { buildSummaryMessage } from "./blocks.ts";
import { PostSummaryFunction } from "./definition.ts";

/**
 * This is the handling code for PostSummaryFunction. It will:
 * 1. Post a message in thread to the draft announcement message
 * with a summary of announcement's sent
 * 2. Complete this function with either required outputs or an error
 */
export default SlackFunction(
  PostSummaryFunction,
  async ({ inputs, client }) => {
    const blocks = buildSummaryMessage(inputs.announcements);

    // 1. Post a message in thread to the draft announcement message
    let postResp;
    try {
      postResp = await client.chat.postMessage({
        channel: inputs.channel,
        thread_ts: inputs.message_ts || "",
        blocks: blocks,
        unfurl_links: false,
      });

      const outputs = {
        channel: inputs.channel,
        message_ts: postResp.ts,
      };

      // 2. Complete function with outputs
      return { outputs: outputs };
    } catch (error) {
      const summaryTS = postResp ? postResp.ts : "n/a";
      const postSummaryErrorMsg =
        `Error posting announcement send summary: ${summaryTS} to channel: ${inputs.channel}. Error details: ${error}`;
      console.log(postSummaryErrorMsg);

      // 2. Complete function with an error message
      return { error: postSummaryErrorMsg };
    }
  },
);
