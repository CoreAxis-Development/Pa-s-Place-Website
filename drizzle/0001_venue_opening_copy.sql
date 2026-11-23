UPDATE "documents"
SET "value" = jsonb_set("value", '{title}', to_jsonb('Gather under the big trees'::text))
WHERE "key" = 'venuePage'
  AND "value" ->> 'title' = 'Your party, under the big trees';
--> statement-breakpoint
UPDATE "documents"
SET "value" = jsonb_set("value", '{intro}', to_jsonb('Hire the lapa and gardens for the day. There’s a covered space with a braai, a pool, mini-golf and plenty of lawn for your group.'::text))
WHERE "key" = 'venuePage'
  AND "value" ->> 'intro' = 'A covered lapa with a braai, a pool with waterslides, mini-golf and wide lawns. Hire the venue for the day and bring your people.';
