# Song Batch Import

Use this for review-first song intake. It does not scrape websites and it does not publish songs automatically.

You can also use the local admin page:

```txt
http://127.0.0.1:3000/admin/import
```

Paste a batch, click **Generate drafts**, review duplicates/invalid rows, then click **Publish selected**.

## Input

Create `imports/songs.batch.json` as a JSON array. Use `imports/songs.batch.example.json` as the shape.

Required:

- `title`
- at least one of `lyrics_hinglish` or `lyrics_hindi`

Recommended:

- `artist`
- `church`
- `source_url`
- `youtube`
- `tags`

Lyrics can be plain text or sectioned with headings like:

```txt
[Verse 1]
Line one
Line two

[Chorus]
Line one
Line two
```

## Run

```bash
npm run import:songs
```

Or pass a specific file:

```bash
npm run import:songs -- imports/my-batch.json
```

## Output

- Draft JSON files: `.song-import/drafts/`
- Duplicate/invalid report: `.song-import/report.json`

The script checks local song files by slug and normalized title. If `.env.local` has Supabase credentials, it also checks the `songs` table by slug/title and skips duplicates already in the live library.

After review, approved drafts can be copied into `src/data/songs/` and uploaded to Supabase with the existing migration script.
