# Releasing to production

The code is being actively developed on the `dev` branch. Pull requests are made against this branch.

After a release is approved by QA, the code goes to the `main` branch and is deployed to the staging environment.

Schematically:
```
<PR branch> –> dev -> main
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

### Tag & release
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
* Create and push a new version tag :
```
git tag v3.15.0
git push --tags
```

* Create a [GitHub release](https://github.com/gnosis/safe-react/releases) for this tag
* Notify devops on Slack and send them the release link to deploy to production
* Back-merge `main` into the `dev` branch to keep them in sync
