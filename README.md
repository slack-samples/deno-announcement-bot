# Announcement Bot

This sample automation helps users draft, edit, and send announcements to one or
more channels.

https://user-images.githubusercontent.com/55667998/211395878-8b261c76-ba7d-4d3f-b7b5-07cbd44efffd.mp4

**Guide Outline**:

- [Included Workflows](#included-workflows)
- [Setup](#setup)
  - [Install the Slack CLI](#install-the-slack-cli)
  - [Clone the Sample](#clone-the-sample)
- [Running Your Project Locally](#running-your-project-locally)
- [Creating Triggers](#creating-triggers)
  - [Usage](#usage)
- [Datastores](#datastores)
- [Testing](#testing)
- [Deploying Your App](#deploying-your-app)
- [Viewing Activity Logs](#viewing-activity-logs)
- [Project Structure](#project-structure)
- [Resources](#resources)

---

## Included Workflows

- **Create announcement**: Create an announcement draft and later edit or send
  it to selected channels

## Setup

Before getting started, first make sure you have a development workspace where
you have permission to install apps. **Please note that the features in this
project require that the workspace be part of
[a Slack paid plan](https://slack.com/pricing).**

### Install the Slack CLI

To use this sample, you need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/automation/quickstart).

### Clone the Sample

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create my-app -t slack-samples/deno-announcement-bot

# Change into the project directory
$ cd my-app
```

## Running Your Project Locally

While building your app, you can see your changes appear in your workspace in
real-time with `slack run`. You'll know an app is the development version if the
name has the string `(local)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

To stop running locally, press `<CTRL> + C` to end the process.

## Creating Triggers

[Triggers](https://api.slack.com/automation/triggers) are what cause workflows
to run. These triggers can be invoked by a user, or automatically as a response
to an event within Slack.

When you `run` or `deploy` your project for the first time, the CLI will prompt
you to create a trigger if one is found in the `triggers/` directory. For any
subsequent triggers added to the application, each must be
[manually added using the `trigger create` command](#manual-trigger-creation).

When creating triggers, you must select the workspace and environment that you'd
like to create the trigger in. Each workspace can have a local development
version (denoted by `(local)`), as well as a deployed version. _Triggers created
in a local environment will only be available to use when running the
application locally._

### Link Triggers

A [link trigger](https://api.slack.com/automation/triggers/link) is a type of
trigger that generates a **Shortcut URL** which, when posted in a channel or
added as a bookmark, becomes a link. When clicked, the link trigger will run the
associated workflow.

Link triggers are _unique to each installed version of your app_. This means
that Shortcut URLs will be different across each workspace, as well as between
[locally run](#running-your-project-locally) and
[deployed apps](#deploying-your-app).

With link triggers, after selecting a workspace and environment, the output
provided will include a Shortcut URL. Copy and paste this URL into a channel as
a message, or add it as a bookmark in a channel of the workspace you selected.
Interacting with this link will run the associated workflow.

**Note: triggers won't run the workflow unless the app is either running locally
or deployed!**

### Manual Trigger Creation

To manually create a trigger, use the following command:

```zsh
$ slack trigger create --trigger-def triggers/create_announcement.ts
```

### Usage

With your app running locally, click the link trigger that you shared in your
Slack workspace. The workflow's first step, an input form, will appear where you
can completed the required fields.

If you'd like, you can compose an announcement using
[Block Kit Builder](https://app.slack.com/block-kit-builder) instead of plain
text or [mrkdwn](https://api.slack.com/reference/surfaces/formatting). Tip: Use
the "Copy Payload" button to copy your Block Kit directly to your clipboard.

Here is the format of the blocks that the app expects:

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "_This_ is an *important* announcement!"
      }
    }
  ]
}
```

Submitting the form will post the message and other details to the draft channel
you provided.

> :bulb: Please note that interactive elements (such as buttons, dropdowns) etc.
> are not supported.

Use the overflow menu found in the draft message to edit the announcement text.
Once ready, click the **Send Announcement** button to post the announcement in
each channel you previously provided in the form.

Once sent, the draft message in channel will be updated and a summary (with
links) will be posted to the thread.

### Notes

- Private channels, DM, and MPDMs are not supported in either the destination
  channels or the draft channel select menus in the
  [OpenForm](https://api.slack.com/automation/functions#open-a-form) built-in
  function.
- A common reason an announcement might fail to send to a destination channel is
  that
  [posting has been restricted](https://slack.com/help/articles/360004635551)
  (`restricted_action` error). Give your app explicit permission to post using
  the channel settings if necessary.

## Datastores

For storing data related to your app, datastores offer secure storage on Slack
infrastructure. For an example of a datastore, see
`datastores/announcements.ts`. The use of a datastore requires the
`datastore:write`/`datastore:read` scopes to be present in your manifest.

## Testing

For an example of how to test a function, see
`functions/create_draft/handler_test.ts`. Test filenames should be suffixed with
`_test`.

Run all tests with `deno test`:

```zsh
$ deno test
```

## Deploying Your App

Once development is complete, deploy the app to Slack infrastructure using
`slack deploy`:

```zsh
$ slack deploy
```

When deploying for the first time, you'll be prompted to
[create a new link trigger](#creating-triggers) for the deployed version of your
app. When that trigger is invoked, the workflow should run just as it did when
developing locally (but without requiring your server to be running).

## Viewing Activity Logs

Activity logs of your application can be viewed live and as they occur with the
following command:

```zsh
$ slack activity --tail
```

## Project Structure

### `.slack/`

Contains `apps.dev.json` and `apps.json`, which include installation details for
development and deployed apps.

Contains `hooks.json` used by the CLI to interact with the project's SDK
dependencies. It contains script hooks that are executed by the CLI and
implemented by the SDK.

### `datastores/`

[Datastores](https://api.slack.com/automation/datastores) securely store data
for your application on Slack infrastructure. Required scopes to use datastores
include `datastore:write` and `datastore:read`.

### `functions/`

[Functions](https://api.slack.com/automation/functions) are reusable building
blocks of automation that accept inputs, perform calculations, and provide
outputs. Functions can be used independently or as steps in workflows.

### `triggers/`

[Triggers](https://api.slack.com/automation/triggers) determine when workflows
are run. A trigger file describes the scenario in which a workflow should be
run, such as a user pressing a button or when a specific event occurs.

### `workflows/`

A [workflow](https://api.slack.com/automation/workflows) is a set of steps
(functions) that are executed in order.

Workflows can be configured to run without user input or they can collect input
by beginning with a [form](https://api.slack.com/automation/forms) before
continuing to the next step.

### `manifest.ts`

The [app manifest](https://api.slack.com/automation/manifest) contains the app's
configuration. This file defines attributes like app name and description.

## Resources

To learn more about developing automations on Slack, visit the following:

- [Automation Overview](https://api.slack.com/automation)
- [CLI Quick Reference](https://api.slack.com/automation/cli/quick-reference)
- [Samples and Templates](https://api.slack.com/automation/samples)
