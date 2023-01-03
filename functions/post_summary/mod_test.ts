import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import {
  assertEquals,
  assertExists,
  assertStringIncludes,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";

import postSummary from "./mod.ts";
import { POST_ANNOUNCEMENT_FUNCTION_CALLBACK_ID } from "./definition.ts";

const { createContext } = SlackFunctionTester(
  POST_ANNOUNCEMENT_FUNCTION_CALLBACK_ID,
);

// Replace globalThis.fetch with the mocked copy
mf.install();

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
  mf.mock("POST@/api/chat.postMessage", () => {
    return new Response(
      `{"ok": true, "ts": "1671571811.846939"}`,
      {
        status: 200,
      },
    );
  });

  const { outputs } = await postSummary(createContext({ inputs }));

  await assertEquals(
    outputs?.channel,
    mockSummaryChannelId,
  );

  await assertExists(
    outputs?.message_ts,
  );
});

Deno.test("outputs error message when chat.postMessage !ok", async () => {
  // Mock failed post message
  mf.mock("POST@/api/chat.postMessage", () => {
    return new Response(
      `{"ok": false, "error": "I am a teapot. I cannot chat.postMessage" }`,
      {
        status: 418,
      },
    );
  });

  const { error } = await postSummary(createContext({ inputs }));
  assertExists(error);
  assertStringIncludes(error, "Error details");
});
