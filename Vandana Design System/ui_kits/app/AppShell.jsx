/* Vandana UI Kit — AppShell: the full interactive prototype */
const { useState: uSS, useEffect: uEE } = React;

function AppShell() {
  const [tab, setTab] = uSS("home");               // home | updates | favourites | settings
  const [songId, setSongId] = uSS(null);           // when non-null, song view is open
  const [presenting, setPresenting] = uSS(false);  // when true, present overlay
  const [favs, setFavs] = uSS(["chamka-sitara", "vandana"]);
  const [defaultLang, setDefaultLang] = uSS("hinglish");

  const song = songId ? SAMPLE_SONGS.find(s => s.id === songId) : null;

  const toggleFav = (id) => setFavs(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const openSong = (id) => { setSongId(id); setPresenting(false); };
  const back = () => { setSongId(null); setPresenting(false); };

  let body;
  if (presenting && song) {
    body = <PresentScreen song={song} onExit={() => setPresenting(false)} />;
  } else if (song) {
    body = <SongScreen song={song} onBack={back}
      onPresent={() => setPresenting(true)}
      favouriteIds={favs} onToggleFav={toggleFav} />;
  } else if (tab === "home") {
    body = <HomeScreen onOpenSong={openSong} favouriteIds={favs} onToggleFav={toggleFav} />;
  } else if (tab === "updates") {
    body = <UpdatesScreen />;
  } else if (tab === "favourites") {
    body = <FavouritesScreen favouriteIds={favs} onOpenSong={openSong} onToggleFav={toggleFav} />;
  } else if (tab === "settings") {
    body = <SettingsScreen defaultLang={defaultLang} setDefaultLang={setDefaultLang} onBack={() => setTab("home")} />;
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden",
      background: "var(--bg-base)", color: "var(--text-primary)",
      display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {body}
      </div>
      {!presenting && (
        <BottomNav active={tab} onNav={(t) => { setSongId(null); setTab(t); }} hasUnread={true} />
      )}
    </div>
  );
}

Object.assign(window, { AppShell });
