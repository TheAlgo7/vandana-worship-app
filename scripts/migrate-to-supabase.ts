import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const SONGS_DIR = path.join(__dirname, '..', 'src', 'data', 'songs')

interface SongJson {
  id: string
  title: string
  artist: string
  church: string
  album: string | null
  language_default: string
  languages_available: string[]
  lyrics: {
    hinglish?: Record<string, string>
    hindi?: Record<string, string>
  }
  links: {
    youtube: string | null
    spotify: string | null
    apple_music: string | null
  }
  tags: string[]
  seo_description: string
  added_by: string
}

async function migrate() {
  const files = fs.readdirSync(SONGS_DIR).filter((f) => f.endsWith('.json'))

  console.log(`\n📂 Found ${files.length} JSON files in src/data/songs/\n`)

  let successCount = 0
  const failures: { id: string; error: string }[] = []

  for (const file of files) {
    const filePath = path.join(SONGS_DIR, file)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const song: SongJson = JSON.parse(raw)

    const row = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      church: song.church,
      album: song.album,
      language_default: song.language_default,
      languages_available: song.languages_available,
      lyrics_hinglish: song.lyrics.hinglish ?? null,
      lyrics_hindi: song.lyrics.hindi ?? null,
      link_youtube: song.links.youtube,
      link_spotify: song.links.spotify,
      link_apple_music: song.links.apple_music,
      tags: song.tags,
      seo_description: song.seo_description,
      added_by: song.added_by,
    }

    const { error } = await supabase.from('songs').upsert(row, { onConflict: 'id' })

    if (error) {
      failures.push({ id: song.id, error: error.message })
      console.log(`  ❌ ${song.id} — ${error.message}`)
    } else {
      successCount++
      console.log(`  ✅ ${song.id}`)
    }
  }

  console.log('\n─────────────────────────────────')
  console.log(`📊 Total songs processed : ${files.length}`)
  console.log(`✅ Successfully upserted : ${successCount}`)
  console.log(`❌ Failed               : ${failures.length}`)

  if (failures.length > 0) {
    console.log('\nFailed songs:')
    for (const f of failures) {
      console.log(`  • ${f.id}: ${f.error}`)
    }
  }

  console.log('')
}

migrate()
