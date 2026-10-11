# Fitsipika sy fitantanana fifaninanana

## 1. Fitsipika fototra
Ny Fanorona Riatra sy ny Vela be dia tsy maintsy ampiharina araka ny fitsipika nohamafisin'ny mpilalao mahay sy ny mpikarakara. Alohan'ny hanoratana ny game engine feno, hamarinina ny:
- firafitry ny solaitrabe sy ny tsipika azo aleha;
- fomba fifindrana sy fakana vato;
- fepetra amin'ny fakana maromaro;
- toe-javatra fiafaran'ny lalao sy fitoviana;
- dingana sy fepetra marina amin'ny Vela be.

## 2. Vela be — fitsipika natolotra ho an'ny tournoi
Ity no famaritana nifanarahana tamin'ny drafitra ankehitriny, ary tsy lazaina ho fitsipika manerantany raha mbola tsy nohamafisin'ny manam-pahaizana:
1. Rehefa vita ny Riatra, ny mpandresy amin'ny Riatra no manolotra vato tsirairay ary tsy maka vato mandritra ny dingana voalohany.
2. Ny mpilalao resy amin'ny Riatra no tsy maintsy maka ilay vato atolotra.
3. Mitohy izany mandra-pahatongan'ny mpanolotra ho vato dimy.
4. Amin'ny dingana faharoa, ny mpanolotra no miezaka maka ny vato an'ny mpilalao Vela.
5. Raha lany ireo vato dimy an'ny mpanolotra, dia heverina ho afaka Vela ilay mpilalao resy tamin'ny Riatra.
6. Raha tsy tratra izany tanjona izany, dia tsy afaka Vela izy.
7. Ho an'ny rafitra tournoi natolotra, Vela iray monja no atao isaky ny Riatra, dia miroso amin'ny match manaraka. Tsy averina tsy misy fetra ny Vela ao anatin'ny match iray.

## 3. Scoring natolotra ho an'ny tournoi

Efa voasoratra ao amin'ny `game/vela.js` ny kajy isa fototra ary misy fitsapana ho azy. Tsy mbola manamarina ho azy ny lalao Vela na ny vokatra avy amin'ny solaitrabe io module io.
Ity dia scoring manokana ho an'ity fifaninanana ity:
- Mpandresy Riatra: 5 isa.
- Raha afaka Vela ilay resy tamin'ny Riatra: mahazo isa fanampiny 3 izy; mijanona amin'ny 5 ny mpandresy Riatra. Vokatra: **5–3**.
- Raha tsy afaka Vela ilay resy: mahazo isa fanampiny 3 ny mpandresy Riatra. Vokatra: **8–0**.

Tsy maintsy aseho amin'ny mpandray anjara ny scoring alohan'ny fisoratana anarana sy alohan'ny hanombohan'ny tournoi. Ny score an'ny lalao sy ny score fanampiny Vela dia tehirizina ho saha misaraka mba ho azo anaovana audit.

## 4. Dingana fitantanana tournoi
```text
DRAFT
  -> REGISTRATION_OPEN
  -> REGISTRATION_CLOSED
  -> PREPARATION
  -> RULES_PUBLISHED
  -> READY_TO_START
  -> IN_PROGRESS
  -> COMPLETED
  -> ARCHIVED
```

### Famaritana
- **DRAFT:** mbola amboarina ny tournoi.
- **REGISTRATION_OPEN:** afaka misoratra anarana ny mpilalao.
- **REGISTRATION_CLOSED:** mikatona ny fisoratana anarana; voaisa ny mpandray anjara.
- **PREPARATION:** fotoana handaminana ny format, ny rounds, ny qualifiers, ny final ary ny fandaharam-potoana.
- **RULES_PUBLISHED:** efa navoaka ny fitsipika sy ny fandaharam-potoana.
- **READY_TO_START:** voamarina ny mpilalao, ny match ary ny mpitsara.
- **IN_PROGRESS:** mandeha ny lalao.
- **COMPLETED:** vita sy voamarina ny vokatra.
- **ARCHIVED:** voatahiry ny tantara sy ny tatitra.

**Fotoana fanomanana natolotra:** 24–48 ora aorian'ny fanidiana fisoratana anarana. Ampifanarahana amin'ny isan'ny mpilalao sy ny fahasarotan'ny tournoi izany, ary tsy maintsy avoaka ny fandaharam-potoana alohan'ny hanombohana.

## 5. Safidy format
Tsy atao raikitra mialoha ny format. Rehefa mikatona ny fisoratana anarana dia mifidy format ny mpikarakara araka ny:
- isan'ny mpilalao voamarina;
- ora sy andro azo anatanterahana ny lalao;
- isan'ny match azon'ny mpilalao atao;
- fomba hamaritana ny laharana sy ny fidirana amin'ny final.

Ny Swiss System miaraka amin'ny final dia safidy azo dinihina, fa tsy voatery ho izy amin'ny tournoi rehetra.

## 6. Fahamarinan'ny vokatra sy fiarovana
- Ny server no manamarina ny hetsika, ny fotoana, ny mpilalao ary ny vokatra.
- Tehirizina ny audit log ho an'ny fanitsiana vokatra sy ny fanapahan-kevitry ny mpitsara.
- Tsy tokony ho azon'ny mpilalao ovaina mivantana ny isa na ny valin'ny match.
- Raha misy fifandirana dia mila dingana mazava hametrahana fitarainana sy hanapahan'ny mpitsara.

## 7. Saram-pidirana sy loka
Ny vola sy ny loka ao amin'ny drafitra dia tombana fotsiny mandra-pahamarin'ny:
- fepetra ara-dalàna;
- saram-pandoavana sy ny fomba fandraisana vola;
- fomba fanamarinana ny fandoavana sy famerenam-bola;
- fandaniana amin'ny sehatra sy ny fitantanana;
- fitsipika momba ny loka, ny fanafoanana ary ny fitarainana.

Alohan'ny hanamarinana ireo dia aleo manao tournoi andrana maimaim-poana. Tsy mampanantena tombom-barotra na loka azo antoka ity antontan-taratasy ity.
