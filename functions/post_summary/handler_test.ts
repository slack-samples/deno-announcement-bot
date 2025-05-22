import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals, assertExists, assertStringIncludes } from "@std/assert";
import { stubFetch } from "../../test_utils.ts";

import postSummary from "./handler.ts";
import { POST_ANNOUNCEMENT_FUNCTION_CALLBACK_ID } from "./definition.ts";

const { createContext } = SlackFunctionTester(
  POST_ANNOUNCEMENT_FUNCTION_CALLBACK_ID,
);

// Setup
const mockSummaryChannelId = "C678910";
// based on function inputs and outputs in "./definition.ts"
const inputs = {
  announcements: [{
    channel_id: "C12345",
    success: true,
    permalink: "",
    error: "",
  }],
  channel: mockSummaryChannelId,
};

Deno.test("outputs received message ts correctly when chat.postMessage ok", async () => {
  // mock a successful response
  using _fetchStub = stubFetch({
    matches: (req) => {
      assertEquals(req.url, "https://slack.com/api/chat.postMessage");
      assertEquals(req.method, "POST");
    },
    response: new Response(
      `{"ok": true, "ts": "1671571811.846939"}`,
      {
        status: 200,
      },
    ),
  });

  const { outputs } = await postSummary(createContext({ inputs }));

  assertEquals(
    outputs?.channel,
    mockSummaryChannelId,
  );

  assertExists(
    outputs?.message_ts,
  );
});

Deno.test("outputs error message when chat.postMessage !ok", async () => {
  // Mock failed post message
  using _fetchStub = stubFetch({
    matches: (req) => {
      assertEquals(req.url, "https://slack.com/api/chat.postMessage");
      assertEquals(req.method, "POST");
    },
    response: new Response(
      `{"ok": false, "error": "I am a teapot. I cannot chat.postMessage" }`,
      {
        status: 200,
      },
    ),
  });

  const { error } = await postSummary(createContext({ inputs }));
  assertExists(error);
  assertStringIncludes(error, "Error detail");
});
