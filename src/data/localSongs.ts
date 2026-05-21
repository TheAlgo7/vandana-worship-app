/**
 * Static local fallback for all songs.
 * Used when Supabase is unavailable (paused, offline, or rate-limited).
 *
 * Every song JSON file in src/data/songs/ is imported here.
 * When Supabase is unreachable and the localStorage cache is expired,
 * getSongs() will return this list so the app never shows "No songs yet."
 */

import type { Song } from "@/lib/getSongs";

import aaBhiJaa from "./songs/aa-bhi-jaa.json";
import aajHaiMahaAnandKaSusamay from "./songs/aaj-hai-maha-anand-ka-susamay.json";
import aajKaDinYahowaNeBanayaHai from "./songs/aaj-ka-din-yahowa-ne-banaya-hai.json";
import aajaRe from "./songs/aaja-re.json";
import aadiAurAnth from "./songs/aadi-aur-anth.json";
import aasmaanoMeinHoga from "./songs/aasmaano-mein-hoga.json";
import aashaMeri from "./songs/aasha-meri.json";
import aashiqTera from "./songs/aashiq-tera.json";
import aatmaKiVedi from "./songs/aatma-ki-vedi.json";
import aatmaRe from "./songs/aatma-re.json";
import abrahamKaPrabhu from "./songs/abraham-ka-prabhu.json";
import abAaoVishwasiyo from "./songs/ab-aao-vishwasiyo.json";
import aeLashkaronKeRab from "./songs/ae-lashkaron-ke-rab.json";
import aeMereDilJhoomKeGaa from "./songs/ae-mere-dil-jhoom-ke-gaa.json";
import anandKiBharpuri from "./songs/anand-ki-bharpuri.json";
import aaoHumYahovaKaDhanyavaadKarein from "./songs/aao-hum-yahova-ka-dhanyavaad-karein.json";
import aurChahiye from "./songs/aur-chahiye.json";
import aurKisiBaatKiBadaaiNaKarein from "./songs/aur-kisi-baat-ki-badaai-na-karein.json";
import aayaHaiYeshuAayaHai from "./songs/aaya-hai-yeshu-aaya-hai.json";
import bharat from "./songs/bharat.json";
import bharpurJeevanTereLiye from "./songs/bharpur-jeevan-tere-liye.json";
import bhalaPita from "./songs/bhala-pita.json";
import bintiSunleYeshuPyare from "./songs/binti-sunle-yeshu-pyare.json";
import boloJaiMilkarJai from "./songs/bolo-jai-milkar-jai.json";
import chaakParApniRakhMujhe from "./songs/chaak-par-apni-rakh-mujhe.json";
import chamkaSitara from "./songs/chamka-sitara.json";
import chaleJaanaHaiDoorSeDoorTalak from "./songs/chale-jaana-hai-door-se-door-talak.json";
import charanoMeinTere from "./songs/charano-mein-tere.json";
import chattan from "./songs/chattan.json";
import chooLeMujhe from "./songs/choo-le-mujhe.json";
import chillakarGaoonga from "./songs/chillakar-gaoonga.json";
import deewana from "./songs/deewana.json";
import deewanaMainYeshuKa from "./songs/deewana-main-yeshu-ka.json";
import desh from "./songs/desh.json";
import dhanyawad from "./songs/dhanyawad.json";
import doorEkTharaJaaRahaaHai from "./songs/door-ek-thara-jaa-rahaa-hai.json";
import doorKahinInRaahon from "./songs/door-kahin-in-raahon.json";
import duniyaKeKonekoneMein from "./songs/duniya-ke-konekone-mein.json";
import ekAisiAgni from "./songs/ek-aisi-agni.json";
import ekDoTeenChar from "./songs/ek-do-teen-char.json";
import ekMahimaKaBaadal from "./songs/ek-mahima-ka-baadal.json";
import gaakeMujhkoSunaoPhir from "./songs/gaake-mujhko-sunao-phir.json";
import gawahi from "./songs/gawahi.json";
import haiDiAawazFarishtoNe from "./songs/hai-di-aawaz-farishto-ne.json";
import haiTu from "./songs/hai-tu.json";
import haathUthaakarGaoonga from "./songs/haath-uthaakar-gaoonga.json";
import hallelujahPrabhuMere from "./songs/hallelujah-prabhu-mere.json";
import halleluyaahHalleluyaahGaayenge from "./songs/halleluyaah-halleluyaah-gaayenge.json";
import haqTala from "./songs/haq-tala.json";
import harSubahHarShaam from "./songs/har-subah-har-shaam.json";
import haanHaiYakeen from "./songs/haan-hai-yakeen.json";
import hazaaronZubane from "./songs/hazaaron-zubane.json";
import hoSitaish from "./songs/ho-sitaish.json";
import hoTeriAradhana from "./songs/ho-teri-aradhana.json";
import hoTeriStutiAurAradhana from "./songs/ho-teri-stuti-aur-aradhana.json";
import hungama from "./songs/hungama.json";
import itnaKareebAa from "./songs/itna-kareeb-aa.json";
import jabSaathHaiMasiha from "./songs/jab-saath-hai-masiha.json";
import jaiJaiPrabhuYeshuKi from "./songs/jai-jai-prabhu-yeshu-ki.json";
import janmaHaiEmmanuel from "./songs/janma-hai-emmanuel.json";
import jeeUthaHaiMasiha from "./songs/jee-utha-hai-masiha.json";
import jhuktaSinghasanPe from "./songs/jhukta-singhasan-pe.json";
import joKuchhWoTumSeKahe from "./songs/jo-kuchh-wo-tum-se-kahe.json";
import jungliDarkhtonKeDarmiyan from "./songs/jungli-darkhton-ke-darmiyan.json";
import kadoshKadosh from "./songs/kadosh-kadosh.json";
import khazana from "./songs/khazana.json";
import kuchNaya from "./songs/kuch-naya.json";
import mainNachdaNahiKade from "./songs/main-nachda-nahi-kade.json";
import oshimiriAtata from "./songs/oshimiri-atata.json";
import paakRuhTu from "./songs/paak-ruh-tu.json";
import panah from "./songs/panah.json";
import papa from "./songs/papa.json";
import pankhonTaley from "./songs/pankhon-taley.json";
import rangLiya from "./songs/rang-liya.json";
import rehaai from "./songs/rehaai.json";
import shaktishaali from "./songs/shaktishaali.json";
import sangTere from "./songs/sang-tere.json";
import teriMarzi from "./songs/teri-marzi.json";
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
import zindaHoonMain from "./songs/zinda-hoon-main.json";
import zindaKhuda from "./songs/zinda-khuda.json";

export const LOCAL_SONGS: Song[] = [
  aaBhiJaa,
  aajHaiMahaAnandKaSusamay,
  aajKaDinYahowaNeBanayaHai,
  aajaRe,
  aadiAurAnth,
  aasmaanoMeinHoga,
  aashaMeri,
  aashiqTera,
  aatmaKiVedi,
  aatmaRe,
  abrahamKaPrabhu,
  abAaoVishwasiyo,
  aeLashkaronKeRab,
  aeMereDilJhoomKeGaa,
  anandKiBharpuri,
  aaoHumYahovaKaDhanyavaadKarein,
  aurChahiye,
  aurKisiBaatKiBadaaiNaKarein,
  aayaHaiYeshuAayaHai,
  bharat,
  bharpurJeevanTereLiye,
  bhalaPita,
  bintiSunleYeshuPyare,
  boloJaiMilkarJai,
  chaakParApniRakhMujhe,
  chamkaSitara,
  chaleJaanaHaiDoorSeDoorTalak,
  charanoMeinTere,
  chattan,
  chooLeMujhe,
  chillakarGaoonga,
  deewana,
  deewanaMainYeshuKa,
  desh,
  dhanyawad,
  doorEkTharaJaaRahaaHai,
  doorKahinInRaahon,
  duniyaKeKonekoneMein,
  ekAisiAgni,
  ekDoTeenChar,
  ekMahimaKaBaadal,
  gaakeMujhkoSunaoPhir,
  gawahi,
  haiDiAawazFarishtoNe,
  haiTu,
  haathUthaakarGaoonga,
  hallelujahPrabhuMere,
  halleluyaahHalleluyaahGaayenge,
  haqTala,
  harSubahHarShaam,
  haanHaiYakeen,
  hazaaronZubane,
  hoSitaish,
  hoTeriAradhana,
  hoTeriStutiAurAradhana,
  hungama,
  itnaKareebAa,
  jabSaathHaiMasiha,
  jaiJaiPrabhuYeshuKi,
  janmaHaiEmmanuel,
  jeeUthaHaiMasiha,
  jhuktaSinghasanPe,
  joKuchhWoTumSeKahe,
  jungliDarkhtonKeDarmiyan,
  kadoshKadosh,
  khazana,
  kuchNaya,
  mainNachdaNahiKade,
  oshimiriAtata,
  paakRuhTu,
  panah,
  papa,
  pankhonTaley,
  rangLiya,
  rehaai,
  shaktishaali,
  sangTere,
  teriMarzi,
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
  zindaHoonMain,
  zindaKhuda,
] as Song[];

/** Quick O(1) lookup for getSongById fallback */
export const LOCAL_SONGS_BY_ID = new Map<string, Song>(
  LOCAL_SONGS.map((s) => [s.id, s])
);
