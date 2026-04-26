/**
 * Static local fallback for all songs.
 * Used when Supabase is unavailable (paused, offline, or rate-limited).
 *
 * Every song JSON file in src/data/songs/ is imported here.
 * When Supabase is unreachable and the localStorage cache is expired,
 * getSongs() will return this list so the app never shows "No songs yet."
 */

import type { Song } from "@/lib/getSongs";

import aashaMeri from "./songs/aasha-meri.json";
import aashiqTera from "./songs/aashiq-tera.json";
import aatmaKiVedi from "./songs/aatma-ki-vedi.json";
import abrahamKaPrabhu from "./songs/abraham-ka-prabhu.json";
import aurChahiye from "./songs/aur-chahiye.json";
import chamkaSitara from "./songs/chamka-sitara.json";
import chooLeMujhe from "./songs/choo-le-mujhe.json";
import deewana from "./songs/deewana.json";
import ekMahimaKaBaadal from "./songs/ek-mahima-ka-baadal.json";
import haqTala from "./songs/haq-tala.json";
import harSubahHarShaam from "./songs/har-subah-har-shaam.json";
import hazaaronZubane from "./songs/hazaaron-zubane.json";
import jabSaathHaiMasiha from "./songs/jab-saath-hai-masiha.json";
import jhuktaSinghasanPe from "./songs/jhukta-singhasan-pe.json";
import kadoshKadosh from "./songs/kadosh-kadosh.json";
import khazana from "./songs/khazana.json";
import kuchNaya from "./songs/kuch-naya.json";
import mainNachdaNahiKade from "./songs/main-nachda-nahi-kade.json";
import oshimiriAtata from "./songs/oshimiri-atata.json";
import paakRuhTu from "./songs/paak-ruh-tu.json";
import pankhonTaley from "./songs/pankhon-taley.json";
import rangLiya from "./songs/rang-liya.json";
import rehaai from "./songs/rehaai.json";
import shaktishaali from "./songs/shaktishaali.json";
import teriOreJabMasih from "./songs/teri-ore-jab-masih.json";
import toreSiwa from "./songs/tore-siwa.json";
import tuRajKare from "./songs/tu-raj-kare.json";
import vandana from "./songs/vandana.json";
import vedi from "./songs/vedi.json";
import virasat from "./songs/virasat.json";
import yahwehSabaoth from "./songs/yahweh-sabaoth.json";
import yeshuGharana from "./songs/yeshu-gharana.json";
import yeshuNaamMila from "./songs/yeshu-naam-mila.json";
import yeshuaHamashiach from "./songs/yeshua-hamashiach.json";
import zindaKhuda from "./songs/zinda-khuda.json";

export const LOCAL_SONGS: Song[] = [
  aashaMeri,
  aashiqTera,
  aatmaKiVedi,
  abrahamKaPrabhu,
  aurChahiye,
  chamkaSitara,
  chooLeMujhe,
  deewana,
  ekMahimaKaBaadal,
  haqTala,
  harSubahHarShaam,
  hazaaronZubane,
  jabSaathHaiMasiha,
  jhuktaSinghasanPe,
  kadoshKadosh,
  khazana,
  kuchNaya,
  mainNachdaNahiKade,
  oshimiriAtata,
  paakRuhTu,
  pankhonTaley,
  rangLiya,
  rehaai,
  shaktishaali,
  teriOreJabMasih,
  toreSiwa,
  tuRajKare,
  vandana,
  vedi,
  virasat,
  yahwehSabaoth,
  yeshuGharana,
  yeshuNaamMila,
  yeshuaHamashiach,
  zindaKhuda,
] as Song[];

/** Quick O(1) lookup for getSongById fallback */
export const LOCAL_SONGS_BY_ID = new Map<string, Song>(
  LOCAL_SONGS.map((s) => [s.id, s])
);
