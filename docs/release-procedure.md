# Releasing to production

The code is being actively developed on the `dev` branch. Pull requests are made against this branch.

When it's time to make a release, we "freeze" the code by creating a release branch off of the `dev` branch. A release PR is created from that branch, and sent to QA.

After the PR is tested and approved by QA, it's merged into the `main` branch. `Main` is automatically deployed to the staging environment.

Schematically:
```
<feature branches> –> dev -> release/X.Y.Z -> main
```

We prepare at least one release every sprint. Sprints are two weeks long.

### Preparing a release branch
* Create a code-freeze branch named `release/X.Y.Z`
  * If it's a regular release, this branch is typically based off of `dev`
  * For hot fixes, it would be `main` + cherry-picked commits
* Bump the version in the `package.json`
* Create a PR with the list of changes

💡 To generate a quick changelog:
```
git log origin/main..origin/dev --pretty=format:'* %s'
```

### QA
* The QA team do regression testing on this branch
* If issues are found, bugfixes are merged into this branch
* Once the QA is done, proceed to the next step

### Releasing to production
Wait for all the checks on GitHub to pass.
* Switch to the main branch and make sure it's up to date:
```
git checkout main
git fetch --all
git reset --hard origin/main
```
* Pull from the release branch:
```
git pull origin release/3.15.0
```
* Push:
```
git push
```

A deploy workflow will kick in and do the following things:

* Deploy the code to staging
* Create a new git tag from the version in package.json
* Create a [GitHub release](https://github.com/safe-global/safe-wallet-web/releases) linked to this tag, with a changelog taken from the release PR
* Build and upload the code to an S3 bucket

After that, the release manager should:

* Notify devops on Slack and send them the release link to deploy to production
* Back-merge `main` into the `dev` branch to keep them in sync unless the release branch was based on `dev`
