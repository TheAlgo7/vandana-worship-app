/* Vandana UI Kit — AppShell v2.5.0
   Wires the interactive prototype. 5-tab nav. Setlist toggle. About + Ministry routing. */
const { useState: uSS } = React;

function AppShell() {
  const [tab, setTab] = uSS("home");
  const [songId, setSongId] = uSS(null);
  const [ministrySlug, setMinistrySlug] = uSS(null);
  const [aboutOpen, setAboutOpen] = uSS(false);
  const [presenting, setPresenting] = uSS(false);
  const [favs, setFavs] = uSS(["chamka-sitara", "vandana"]);
  const [setlist, setSetlist] = uSS(["kadosh-kadosh", "yeshua-hamashiach"]);
  const [defaultLang, setDefaultLang] = uSS("hinglish");
  const [setlistEnabled, setSetlistEnabled] = uSS(true);

  const song = songId ? SAMPLE_SONGS.find(s => s.id === songId) : null;
  const ministry = ministrySlug ? MINISTRIES.find(m => m.slug === ministrySlug) : null;

  const toggleFav = (id) =>
    setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);
  const toggleSetlist = (id) =>
    setSetlist(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const openSong = (id) => { setSongId(id); setPresenting(false); setAboutOpen(false); setMinistrySlug(null); };
  const back = () => { setSongId(null); setPresenting(false); setAboutOpen(false); setMinistrySlug(null); };

  let body;
  if (presenting && song) {
    body = <PresentScreen song={song} onExit={() => setPresenting(false)} />;
  } else if (aboutOpen) {
    body = <AboutScreen onBack={back} />;
  } else if (ministry) {
    body = <MinistryScreen ministry={ministry} onBack={back}
      onOpenSong={openSong}
      favouriteIds={favs} setlistIds={setlist}
      onToggleFav={toggleFav} onToggleSetlist={toggleSetlist} />;
  } else if (song) {
    body = <SongScreen song={song} onBack={back}
      onPresent={() => setPresenting(true)}
      favouriteIds={favs} onToggleFav={toggleFav}
      isInSetlist={setlist.includes(song.id)}
      onToggleSetlist={toggleSetlist} />;
  } else if (tab === "home") {
    body = <HomeScreen onOpenSong={openSong}
      onOpenMinistry={(slug) => setMinistrySlug(slug)}
      favouriteIds={favs} setlistIds={setlist}
      onToggleFav={toggleFav} onToggleSetlist={toggleSetlist} />;
  } else if (tab === "updates") {
    body = <UpdatesScreen />;
  } else if (tab === "setlist") {
    body = <SetlistScreen setlistIds={setlist}
      favouriteIds={favs}
      onOpenSong={openSong}
      onToggleFav={toggleFav} onToggleSetlist={toggleSetlist}
      onPresent={(id) => { setSongId(id); setPresenting(true); }}
      onClear={() => setSetlist([])} />;
  } else if (tab === "favourites") {
    body = <FavouritesScreen favouriteIds={favs} setlistIds={setlist}
      onOpenSong={openSong}
      onToggleFav={toggleFav} onToggleSetlist={toggleSetlist} />;
  } else if (tab === "settings") {
    body = <SettingsScreen defaultLang={defaultLang} setDefaultLang={setDefaultLang}
      setlistEnabled={setlistEnabled} setSetlistEnabled={setSetlistEnabled}
      onAbout={() => setAboutOpen(true)} />;
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden",
      background: "var(--bg-base)", color: "var(--text-primary)",
      display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {body}
      </div>
      {!presenting && (
        <BottomNav active={tab} setlistEnabled={setlistEnabled}
          onNav={(t) => { setSongId(null); setAboutOpen(false); setMinistrySlug(null); setTab(t); }}
          hasUnread />
      )}
    </div>
  );
}

Object.assign(window, { AppShell });
