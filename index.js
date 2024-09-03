// For more information on building apps:
// https://probot.github.io/docs/

// To get your app running against GitHub, see:
// https://probot.github.io/docs/development/

const util = {
  production: true,
  tags: [
    {
      prefix: "[ARTICLE]",
      label: "article request",
    },
    {
      prefix: "[FEATURE]",
      label: "enhancement",
    },
    {
      prefix: "[BUG]",
      label: "bug",
    },
  ],
  getName(contributor) {
    return `${this.production ? "@" : ""}${contributor}`;
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
          body: `❌ Issue-ს აუცილებლად უნდა გააჩნდეს პრეფიქსი: ${util.tags
            .map((tag) => `**${tag.prefix}**`)
            .join(
              " ან "
            )}. გამოიყენეთ [template](https://github.com/educata/iswavle/issues/new/choose).`,
        })
      );

      await context.octokit.issues.update(context.issue({ state: "closed" }));
      return;
    }

    if (!context.payload.issue.body) {
      await context.octokit.issues.createComment(
        context.issue({
          body: "❌ შეავსეთ ინფორმაცია, უკეთესი სტრუქტურისთვის გამოიყენეთ [template](https://github.com/educata/iswavle/issues/new/choose).",
        })
      );
      await context.octokit.issues.update(context.issue({ state: "closed" }));
      return;
    }

    const issueComment = context.issue({
      body: `მადლობა Issue-ს შექმნისთვის 🎉 ${KOSTA} და ${PRIDON} მალე გიპასუხებენ 🤟`,
    });
    await context.octokit.issues.createComment(issueComment);
    console.log(context.payload.issue);

    if (context.payload.issue.assignees.length === 0) {
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
