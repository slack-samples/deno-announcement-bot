# 📯 Deno Announcement Bot

A next-gen app helping users draft, edit and send announcements to one or more
channels in their workspace. This app uses
[datastores](https://api.slack.com/future/datastores).

https://user-images.githubusercontent.com/55667998/211395878-8b261c76-ba7d-4d3f-b7b5-07cbd44efffd.mp4

**Guide Outline**:

- [Supported Workflows](#supported-workflows)
- [Setup](#setup)
  - [Install the Slack CLI](#install-the-slack-cli)
  - [Clone the Template](#clone-the-template)
- [Create a Link Trigger](#create-a-link-trigger)
- [Running Your Project Locally](#running-your-project-locally)
- [Usage](#usage)
  - [Notes](#notes)
- [Testing](#testing)
- [Deploying Your App](#deploying-your-app)
  - [Viewing Activity Logs](#viewing-activity-logs)
- [Project Structure](#project-structure)
- [Resources](#resources)

---

## Supported Workflows

- **Create announcement**: Create an announcement draft and later edit or send
  it to selected channel(s).

## Setup

Before getting started, make sure you have a development workspace where you
have permissions to install apps. If you don’t have one set up, go ahead and
[create one](https://slack.com/create). Also, please note that the workspace
requires any of [the Slack paid plans](https://slack.com/pricing).

### Install the Slack CLI

To use this sample, you first need to install and configure the Slack CLI.
Step-by-step instructions can be found in our
[Quickstart Guide](https://api.slack.com/future/quickstart).

### Clone the Template

Start by cloning this repository:

```zsh
# Clone this project onto your machine
$ slack create deno-announcement-bot -t slack-samples/deno-announcement-bot

# Change into this project directory
$ cd deno-announcement-bot
```

## Create a link trigger

[Triggers](https://api.slack.com/future/triggers) are what cause workflows to
run. Triggers can be invoked by a user, or automatically as a response to an
event within Slack.

A [link trigger](https://api.slack.com/future/triggers/link) is a type of
trigger that generates a **Shortcut URL** which, when posted in a channel or
added as a bookmark, becomes a link. When clicked, the link trigger will run the
associated workflow.

Link triggers are _unique to each installed version of your app_. This means
that Shortcut URLs will be different across each workspace, as well as between
[locally run](#running-your-project-locally) and
[deployed apps](#deploying-your-app). When creating a trigger, you must select
the Workspace that you'd like to create the trigger in. Each Workspace has a
development version (denoted by `(dev)`), as well as a deployed version.

To create a link trigger, run the following command:

```zsh
$ slack trigger create --trigger-def ./triggers/create_announcement.ts
```

After selecting a Workspace, the output provided will include the link trigger
Shortcut URL. Copy and paste this URL into a channel as a message, or add it as
a bookmark in a channel of the Workspace you selected.

**Note: this link won't run the workflow until the app is either running locally
or deployed!** Read on to learn how to run your app locally and eventually
deploy it to Slack hosting.

## Running Your Project Locally

While building your app, you can see your changes propagated to your workspace
in real-time with `slack run`. In both the CLI and in Slack, you'll know an app
is the development version if the name has the string `(dev)` appended.

```zsh
# Run app locally
$ slack run

Connected, awaiting events
```

Once running, [previously created Shortcut URLs](#create-a-link-trigger)
associated with the `(dev)` version of your app can be used to start workflows.

To stop running locally, press `<CTRL> + C` to end the process.

## Usage

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
  [OpenForm](https://api.slack.com/future/functions#open-a-form) built-in
  function.
- A common reason an announcement might fail to send to a destination channel is
  that
  [posting has been restricted](https://slack.com/help/articles/360004635551)
  (`restricted_action` error). Give your app explicit permission to post using
  the channel settings if necessary.

## Testing

Test filenames should be suffixed with `_test`. Run all tests with `deno test`:

```zsh
$ deno test
```

## Deploying Your App

Once you're done with development, you can deploy the production version of your
app to Slack hosting using `slack deploy`:

```zsh
$ slack deploy
```

After deploying, [create new link triggers](#create-a-link-trigger) for the
production version of your app (not appended with `(dev)`). Once the triggers
are invoked, the associated workflows should run just as they did when
developing locally.

### Viewing Activity Logs

Activity logs for the production instance of your application can be viewed with
the `slack activity` command:

```zsh
$ slack activity
```

## Project Structure

### `manifest.ts`

The [app manifest](https://api.slack.com/future/manifest) contains the app's
configuration. This file defines attributes like app name and description.

### `slack.json`

Used by the CLI to interact with the project's SDK dependencies. It contains
script hooks that are executed by the CLI and implemented by the SDK.

### `/functions`

[Functions](https://api.slack.com/future/functions) are reusable building blocks
of automation that accept inputs, perform calculations, and provide outputs.
Functions can be used independently or as steps in workflows.

### `/workflows`

A [workflow](https://api.slack.com/future/workflows) is a set of steps that are
executed in order. Each step in a workflow is a function, either a custom or
built-in one.

Workflows can be configured to run without user input or they can collect input
by beginning with a [form](https://api.slack.com/future/forms) before continuing
to the next step.

### `/triggers`

[Triggers](https://api.slack.com/future/triggers) determine when workflows are
executed. A trigger file describes a scenario in which a workflow should be run,
such as a user pressing a button or when a specific event occurs.

### `/datastores`

[Datastores](https://api.slack.com/future/datastores) can securely store and
retrieve data for your application. Required scopes to use datastores include
`datastore:write` and `datastore:read`.

## Resources

To learn more about developing with the CLI, you can visit the following guides:

- [Creating a new app with the CLI](https://api.slack.com/future/create)
- [Configuring your app](https://api.slack.com/future/manifest)
- [Developing locally](https://api.slack.com/future/run)

To view all documentation and guides available, visit the
[Overview page](https://api.slack.com/future/overview).
