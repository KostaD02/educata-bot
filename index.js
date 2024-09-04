const util = {
  silent: false,
  tags: [
    {
      prefix: "[ARTICLE]",
      label: "article request",
      showForTemplate: true,
    },
    {
      prefix: "[FEATURE]",
      label: "enhancement",
      showForTemplate: true,
    },
    {
      prefix: "[BUG]",
      label: "bug",
      showForTemplate: true,
    },
    {
      prefix: "[DOC]",
      label: "documentation",
      showForTemplate: true,
    },
    {
      prefix: "[DUPLICATE]",
      label: "duplicate",
      showForTemplate: false,
    },
    {
      prefix: "[EDIT]",
      label: "editing article",
      showForTemplate: true,
    },
    {
      prefix: "[HELP]",
      label: "help wanted",
      showForTemplate: true,
    },
    {
      prefix: "[INVALID]",
      label: "invalid",
      showForTemplate: false,
    },
  ],
  getName(contributor) {
    return `${this.silent ? "" : "@"}${contributor}`;
  },
};

const CODE_OWNERS = ["KostaD02", "CondensedMilk7"];

const KOSTA = util.getName(CODE_OWNERS[0]);
const PRIDON = util.getName(CODE_OWNERS[1]);

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
export default (app) => {
  app.on("issues.opened", async (context) => {
    const title = context.payload.issue.title;
    const tag = util.tags.find((tag) => title.startsWith(tag.prefix));

    if (!tag) {
      await context.octokit.issues.createComment(
        context.issue({
          body: `${
            context.payload.issue.body
              ? ""
              : "❌ Issue-ს აუცილებლად უნდა გააჩნდეს კონტენტი!\n"
          }❌ Issue-ს აუცილებლად უნდა გააჩნდეს რომელიმე პრეფიქსი:\n${util.tags
            .filter((tag) => tag.showForTemplate)
            .sort((a, b) => a.prefix.length - b.prefix.length)
            .map((tag) => `- ${tag.prefix}`)
            .join(
              "\n"
            )}\n\nგამოიყენეთ [template](https://github.com/educata/iswavle/issues/new/choose).`,
        })
      );

      await context.octokit.issues.update(
        context.issue({ state: "closed", labels: ["invalid"] })
      );
      return;
    }

    if (!context.payload.issue.body) {
      await context.octokit.issues.createComment(
        context.issue({
          body: "❌ შეავსეთ ინფორმაცია, უკეთესი სტრუქტურისთვის გამოიყენეთ [template](https://github.com/educata/iswavle/issues/new/choose).",
          labels: ["invalid"],
        })
      );
      await context.octokit.issues.update(context.issue({ state: "closed" }));
      return;
    }

    if (context.payload.issue.title.trim() === tag.prefix) {
      await context.octokit.issues.createComment(
        context.issue({
          body: "❌ სათაური არ შეიძლება იყოს მხოლოდ პრეფიქსი.",
          labels: ["invalid"],
        })
      );
      await context.octokit.issues.update(context.issue({ state: "closed" }));
      return;
    }

    const issueComment = context.issue({
      body: `მადლობა Issue-ს შექმნისთვის 🎉 ${KOSTA} და ${PRIDON} მალე გიპასუხებენ 🤟`,
    });
    await context.octokit.issues.createComment(issueComment);

    if (context.payload.issue.assignees.length === 0 && !util.silent) {
      await context.octokit.issues.addAssignees(
        context.issue({ assignees: CODE_OWNERS })
      );
    }

    if (
      context.payload.issue.labels &&
      context.payload.issue.labels.length === 0
    ) {
      await context.octokit.issues.addLabels(
        context.issue({ labels: [tag.label] })
      );
    }
  });
};
