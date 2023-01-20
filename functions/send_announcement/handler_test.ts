import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";

import sendAnnouncement from "./handler.ts";
import { SEND_ANNOUNCEMENT_FUNCTION_CALLBACK_ID } from "./definition.ts";

const { createContext } = SlackFunctionTester(
  SEND_ANNOUNCEMENT_FUNCTION_CALLBACK_ID,
);

// Replace globalThis.fetch with the mocked copy
mf.install();

// mock the Slack API method response payloads
mf.mock("POST@/api/chat.postMessage", () => {
  return new Response(
    `{"ok": true, "ts": "1671571811.846939"}`,
    {
      status: 200,
    },
  );
});

mf.mock("POST@/api/chat.getPermalink", () => {
  return new Response(
    `{"ok": true, "permalink": "https://my.slack.com/archives/C12345678/p1671571811846939"}`,
    {
      status: 200,
    },
  );
});

mf.mock("POST@/api/apps.datastore.put", () => {
  /**
   * There are multiple requests to this endpoint in this fn.
   * It is called once for each item in the `inputs.channels` array
   * to create a record in the `announcements` datastore.
   * It is called one final time to update a record in the
   * `drafts` datastore.
   *
   * The request to each datastore should return a different Response
   * containing different item properties. But there doesn't appear to
   * be a way to inspect the request body in mock_fetch to know which
   * Response should be returned.
   *
   * Since the fn only uses the properties returned by the last request
   * to the `drafts` datastore in a subsequent line, that is the response
   * returned below. The Response properties of the PUT requests to the
   * `announcements` datastore do not matter for the sake of this test.
   */
  return new Response(
    `{"ok": true, "datastore": "drafts", "item": {"id": "82dfeed3-fde5-4183-b092-e1b2d77ca369", "created_by": "U12345678", "message": "_This_ is an *important* announcement!", "channels": "['C12345678']", "channel": "C87654321", "message_ts": "1671571811.846939"}}`,
    {
      status: 200,
    },
  );
});

mf.mock("POST@/api/chat.update", () => {
  return new Response(
    `{"ok": true, "channel": "C87654321", "ts": "1671571811.846939"}`,
    {
      status: 200,
    },
  );
});

Deno.test("run send announcement fn and return outputs", async () => {
  // based on function inputs and outputs in "./mod.ts"
  const inputs = {
    message: "_This_ is an *important* announcement!",
    channels: ["C12345678"],
    icon: ":robot_face:",
    username: "Testing",
    draft_id: "82dfeed3-fde5-4183-b092-e1b2d77ca369",
  };
  const { outputs } = await sendAnnouncement(createContext({ inputs }));
  await assertEquals(
    outputs?.announcements,
    // @ts-ignore 'error' property not required in fn output
    [{
      channel_id: "C12345678",
      success: true,
      permalink: "https://my.slack.com/archives/C12345678/p1671571811846939",
    }],
  );
});
