# Local preview

`npm run dev` uses the isolated Neon `test/cms-preview` branch defined in the git-ignored `.env.neon-test`. Authentication and CMS data never point at production.

The branch is intentionally empty after cleanup. Add temporary content through the local admin or use a guarded fixture script when a particular scale or image scenario must be tested. Every fixture is visibly labelled as test content.

Apply reviewed content migrations to the test branch before developing against a new schema. Use pooled connections at runtime and the direct connection only for migrations.

To return the branch to an empty state:

```sh
node --import tsx scripts/reset-test-data.ts --confirm-test-branch
```

The reset removes CMS documents, sessions and throttles when present, but never changes production. Local filesystem media in `.local-storage/` can be removed separately because it is ignored and disposable.
