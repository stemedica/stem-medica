# Admin workspace

Open `/auth/login` and sign in with the privately provisioned administrator account. The workspace has five areas:

- **Overview** shows current publication counts and recent posts.
- **Catalogue** manages categories, equipment, images and publication state.
- **Updates & blog** manages articles and arrival notices.
- **Requests** lists quotation requests from the public website, newest first.
- **Proformas** creates, saves and exports quotations.

## Saving safely

Catalogue and post changes are explicit: use Save draft, Publish or Unpublish. The editor warns before leaving with unsaved work and rejects a save if another tab changed the same document first. Validation identifies the item and field that needs attention without discarding entered values.

Proforma drafts are optional and expire seven days after creation. Export a PDF or Word-compatible document for the permanent record. Exporting does not save a draft automatically.

## Account operations

Accounts are not created in the browser. Use the guarded commands in [AUTH.md](AUTH.md) to create the administrator or reset a password. A password reset revokes every active session.

## Production checks

After a deployment:

1. Sign in and sign out once.
2. Submit a test quotation request from `/quote` and confirm it appears under Requests.
3. Add one draft product and confirm it is not public.
4. Publish it, verify the public page, then remove it if it was only a test.
5. Confirm the daily proforma cleanup job is succeeding in Vercel.

Do not publish sample inventory, unconfirmed availability, prices or medical claims. Production starts empty so the first public content must be approved company content.
