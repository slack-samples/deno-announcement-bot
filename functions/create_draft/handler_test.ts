import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals, assertExists, assertFalse } from "@std/assert";

import createDraft from "./handler.ts";
import { CREATE_DRAFT_FUNCTION_CALLBACK_ID } from "./definition.ts";
import { stub } from "@std/testing/mock";

const { createContext } = SlackFunctionTester(
  CREATE_DRAFT_FUNCTION_CALLBACK_ID,
);

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
  using _fetchStub = stub(
    globalThis,
    "fetch",
    (url: string | URL | Request, options?: RequestInit) => {
      const req = url instanceof Request ? url : new Request(url, options);
      assertEquals(req.method, "POST");
      switch (req.url) {
        case "https://slack.com/api/apps.datastore.put":
          return Promise.resolve(
            new Response(
              `{"ok": true}`,
              {
                status: 200,
              },
            ),
          );
        case "https://slack.com/api/apps.datastore.update":
          return Promise.resolve(
            new Response(
              `{"ok": true}`,
              {
                status: 200,
              },
            ),
          );
        case "https://slack.com/api/chat.postMessage":
          return Promise.resolve(
            new Response(
              `{"ok": true, "ts": "1671571811.846939"}`,
              {
                status: 200,
              },
            ),
          );
        default:
          throw Error(
            `No stub found for ${req.method} ${req.url}\nHeaders: ${
              JSON.stringify(Object.fromEntries(req.headers.entries()))
            }`,
          );
      }
    },
  );

  const { completed } = await createDraft(createContext({ inputs }));

  // Function should return without error and complete === false
  assertExists(completed);
  assertFalse(completed);
});

Deno.test("returns an error if initial draft record in datastore fails (apps.datastore.put)", async () => {
  // Mock Slack API method responses
  // failed datastore request
  using _fetchStub = stub(
    globalThis,
    "fetch",
    (url: string | URL | Request, options?: RequestInit) => {
      const req = url instanceof Request ? url : new Request(url, options);
      assertEquals(req.method, "POST");
      assertEquals(req.url, "https://slack.com/api/apps.datastore.put");
      return Promise.resolve(
        new Response(
          `{"ok": false}`,
          {
            status: 200,
          },
        ),
      );
    },
  );

  const { error } = await createDraft(createContext({ inputs }));
  assertExists(error);
});

Deno.test("returns an error if draft announcement fails to post (chat.postMessage)", async () => {
  // failed chat.postMessage
  using _fetchStub = stub(
    globalThis,
    "fetch",
    (url: string | URL | Request, options?: RequestInit) => {
      const req = url instanceof Request ? url : new Request(url, options);
      assertEquals(req.method, "POST");
      switch (req.url) {
        case "https://slack.com/api/apps.datastore.put":
          return Promise.resolve(
            new Response(
              `{"ok": true}`,
              {
                status: 200,
              },
            ),
          );
        case "https://slack.com/api/chat.postMessage":
          return Promise.resolve(
            new Response(
              `{"ok": false}`,
              {
                status: 200,
              },
            ),
          );
        default:
          throw Error(
            `No stub found for ${req.method} ${req.url}\nHeaders: ${
              JSON.stringify(Object.fromEntries(req.headers.entries()))
            }`,
          );
      }
    },
  );

  const { error } = await createDraft(createContext({ inputs }));
  assertExists(error);
});
