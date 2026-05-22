export interface MinistryConfig {
  slug: string;
  name: string;
  description: string;
  filterBy: "church" | "artist";
  filterValue: string;
}

export const MINISTRIES: MinistryConfig[] = [
  {
    slug: "icm",
    name: "Isus Christos Ministries (ICM)",
    description:
      "Hindi and Hinglish worship songs from Isus Christos Ministries, led by Ps. Arul Thomas and Dr. Mahima John Arul. ICM compositions form the heart of the Vandana library.",
    filterBy: "church",
    filterValue: "ICM",
  },
  {
    slug: "nations-of-worship",
    name: "Nations of Worship",
    description:
      "Worship songs from Nations of Worship — Hindi and Hinglish Christian praise and worship music for Indian churches.",
    filterBy: "church",
    filterValue: "Nations of Worship",
  },
  {
    slug: "bridge-music",
    name: "Bridge Music",
    description:
      "Hindi and Hinglish worship songs from Bridge Music. Contemporary Indian Christian worship music in Roman transliteration and Devanagari script.",
    filterBy: "artist",
    filterValue: "Bridge Music",
  },
  {
    slug: "yeshua-band",
    name: "Yeshua Band",
    description:
      "Worship songs by Yeshua Band — one of India's leading Hindi Christian worship artists with an extensive library of praise songs in Hindi and Hinglish.",
    filterBy: "artist",
    filterValue: "Yeshua Band",
  },
  {
    slug: "anil-kant",
    name: "Anil Kant",
    description:
      "Hindi and Hinglish worship songs by Anil Kant. Gospel music and Christian praise songs for Indian congregations.",
    filterBy: "artist",
    filterValue: "Anil Kant",
  },
  {
    slug: "sheldon-bangera",
    name: "Sheldon Bangera",
    description:
      "Hindi worship songs by Sheldon Bangera — popular Indian Christian worship artist. Lyrics available in Hinglish and Hindi.",
    filterBy: "artist",
    filterValue: "Sheldon Bangera",
  },
  {
    slug: "filadelfia-music",
    name: "Filadelfia Music",
    description:
      "Hindi and Hinglish Christian worship songs from Filadelfia Music. Devotional songs for Indian church worship.",
    filterBy: "artist",
    filterValue: "Filadelfia Music",
  },
  {
    slug: "jaago-music",
    name: "Jaago Music",
    description:
      "Worship songs from Jaago Music — Hindi Christian worship music for praise and prayer gatherings.",
    filterBy: "artist",
    filterValue: "Jaago Music",
  },
  {
    slug: "amit-kamble",
    name: "Amit Kamble",
    description:
      "Hindi and Hinglish worship songs by Amit Kamble. Contemporary Christian praise music for Indian churches.",
    filterBy: "artist",
    filterValue: "Amit Kamble",
  },
  {
    slug: "ernest-mall",
    name: "Ernest Mall",
    description:
      "Hindi worship songs by Ernest Mall. Indian Christian worship music available in Hinglish and Hindi script.",
    filterBy: "artist",
    filterValue: "Ernest Mall",
  },
  {
    slug: "ankit-sajwan",
    name: "Ankit Sajwan Ministries",
    description:
      "Worship songs from Ankit Sajwan Ministries (FOLJ Church). Hindi and Hinglish Christian praise music.",
    filterBy: "artist",
    filterValue: "Ankit Sajwan Ministries",
  },
  {
    slug: "yeshua-ministries",
    name: "Yeshua Ministries",
    description:
      "Hindi and Hinglish worship songs from Yeshua Ministries. Christian worship music for Indian congregations.",
    filterBy: "artist",
    filterValue: "Yeshua Ministries",
  },
];

export const MINISTRY_BY_SLUG = new Map(MINISTRIES.map((m) => [m.slug, m]));
