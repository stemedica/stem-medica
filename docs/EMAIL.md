# info@stemedicaet.com

The confirmed domain is **stemedicaet.com**, with one `m`. The site already uses this spelling. Domain registrar: Porkbun. No email provider has been configured in this implementation.

On 2026-09-16, public DNS checks through Google's resolver returned NXDOMAIN for NS, A and MX. First check that this exact domain appears as active in Porkbun, verify the registration/contact email, and check its nameserver assignment. A domain in the account may still need activation or delegation. Do not buy a second domain without checking the existing registration.

## Recommended free mailbox: Zoho Mail

[Zoho's Forever Free plan](https://www.zoho.com/mail/zohomail-pricing.html) offers one custom domain, up to five users and 5 GB per user, where available. Use Zoho webmail or its mobile app. IMAP, POP and ActiveSync are excluded, and availability depends on the signup region/data centre. Confirm the free plan is offered before proceeding; a trial is not the same as Forever Free.

1. Create the Zoho organisation using an existing working email for recovery, select the free plan, and add `stemedicaet.com`.
2. Copy Zoho's domain-verification TXT record into the domain's authoritative DNS. If Porkbun nameservers are active, use Porkbun's DNS management screen.
3. Verify ownership in Zoho, then create the `info` mailbox and enable multifactor authentication.
4. Add the exact MX records and priorities shown in your Zoho Admin Console. Values vary by data centre. Replace old mail-provider MX records only after checking that no existing mailbox depends on them. Keep the website's A/CNAME records.
5. Add Zoho's SPF and DKIM records. If an SPF record already exists, merge authorised senders into one SPF record instead of adding a second. Verify DKIM in Zoho.
6. Start DMARC monitoring with a TXT record at `_dmarc`, value `v=DMARC1; p=none`. Add a reporting address only if it is a mailbox you control. After validating legitimate mail, choose a stronger policy.
7. Test incoming mail from a separate external account, reply from Zoho as `info@stemedicaet.com`, and inspect the received headers for SPF, DKIM and DMARC results.

Provider-generated verification TXT and DKIM values are needed before an exact DNS change set can be prepared. Passwords and account recovery codes should not be pasted into chat or committed to the repository.

Sources: [Zoho domain verification](https://www.zoho.com/mail/help/adminconsole/domain-verification.html), [MX configuration](https://www.zoho.com/mail/help/adminconsole/configure-email-delivery.html), [email hosting setup](https://www.zoho.com/mail/help/adminconsole/email-hosting-setup.html).

## Free fallback: Porkbun forwarding

Porkbun includes 20 free forwards per domain. In Domain Management, open the envelope icon for `stemedicaet.com`, enter `info` as the forwarding address and an existing working inbox as the destination. Follow Porkbun's DNS instructions if nameservers are elsewhere.

This receives mail addressed to `info@stemedicaet.com`, but replies come from the destination account. It is not a full send-and-receive mailbox. Do not combine Porkbun forwarding MX records with Zoho MX records; choose one receiving provider for the domain.

Source: [Porkbun forwarding setup](https://kb.porkbun.com/article/10-how-to-set-up-email-forwarding-service).

## Website quotation requests

The quote form currently prepares an email in the visitor's mail application. It does not send mail through Vercel or guarantee delivery. Activating the mailbox makes the destination usable. Automated form delivery would require a separate transactional email integration; do not assume a free mailbox includes that service.
