import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
import {
  assertExists,
  assertFalse,
} from "https://deno.land/std@0.153.0/testing/asserts.ts";

import createDraft from "./handler.ts";
import { CREATE_DRAFT_FUNCTION_CALLBACK_ID } from "./definition.ts";

const { createContext } = SlackFunctionTester(
  CREATE_DRAFT_FUNCTION_CALLBACK_ID,
);

// Replace global this.fetch with mocked copy
mf.install();

// Setup inputs based on function inputs and outputs in "./definition.ts"
const inputs = {
  created_by: "dummyUserId",
  message: "The content of the announcement",
  channel: "dummyChannelId",
  channels: ["id1", "id2"],
  icon: "icon.png",
  username: "dummyUser",
};

Deno.test("successfully posts an announcement draft and returns completed:false", async () => {
  // Mock Slack API method responses
  // successful datastore request
  mf.mock("POST@/api/apps.datastore.put", () => {
    return new Response(
      `{"ok": true}`,
      {
        status: 200,
      },
    );
  });

  // successful chat.postMessage
  mf.mock("POST@/api/chat.postMessage", () => {
    return new Response(
      `{"ok": true, "ts": "1671571811.846939"}`,
      {
        status: 200,
      },
    );
  });

  const { completed } = await createDraft(createContext({ inputs }));

  // Function should return without error and complete === false
  assertExists(completed);
  assertFalse(completed);
});
Deno.test("returns an error if initial draft record in datastore fails (apps.datastore.put)", async () => {
  // Mock Slack API method responses
  // failed datastore request
  mf.mock("POST@/api/apps.datastore.put", () => {
    return new Response(
      `{"ok": false}`,
      {
        status: 200,
      },
    );
  });

  const { error } = await createDraft(createContext({ inputs }));
  assertExists(error);
});
Deno.test("returns an error if draft announcement fails to post (chat.postMessage)", async () => {
  // failed chat.postMessage
  mf.mock("POST@/api/chat.postMessage", () => {
    return new Response(
      `{"ok": false}`,
      {
        status: 200,
      },
    );
  });
  const { error } = await createDraft(createContext({ inputs }));
  assertExists(error);
});
