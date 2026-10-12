# Fanorona Online 🇲🇬

Sehatra Fanorona malagasy natao ho an'ny finday sy navigateur, miaraka amin'ny AI, lalao olona roa amin'ny fitaovana iray, ary fanomanana fifaninanana.

## Sata ankehitriny
Misy fomba filalaovana roa: **miady amin'ny AI** na **olona roa mifandimby amin'ny écran iray**. Afaka misafidy loko ny mpilalao ary manalehibe na mampihena ny solaitrabe. Ny AI dia mampiasa search minimax sy fanombanana ny vato ary ny fahafahan'ny mpilalao mihetsika; mbola mila fanatsarana sy fitsapana amin'ny mpilalao Fanorona mahay izy.

Misy formulaire handefasana hevitra momba ny lalao sy ny fifaninanana. Manokatra ny application email an'ny mpilalao izy, ka tsy mitahiry na mandefa hafatra ho azy ny tranonkala raha tsy tsindrin'ny mpilalao ny Send ao amin'ny email-ny.

Misy dingana voalohany amin'ny Supabase ho an'ny kaonty mpilalao, famoronana/fidirana efitra amin'ny kaody, ary chat tehirizina sy havaozina amin'ny Realtime. Ny fampifanarahana ny hetsika eo amin'ny solaitrabe, ny fanamarinana hetsika amin'ny server, ny audio/video, ary ny fiarovana feno amin'ny fifaninanana dia mbola tsy vita. Tsy tokony hambara ho efa vonona ny multiplayer feno na ny fifaninanana lehibe raha tsy voasedra ireo.

## Hijery sy hanandrana
- Lalao: https://raismrakotoniaina-hash.github.io/fanorona-online/
- Repository: https://github.com/raismrakotoniaina-hash/fanorona-online
- Alefaso amin'ny navigateur na static hosting ny `index.html`.
- Ny `styles.css` no mifehy ny endrika responsive sy ny zoom.
- Ny `app.js` no mitantana ny interface sy ny fifandimbiasan'ny mpilalao.
- Ny `game/engine.js` no logic fototry ny lalao.
- Ny `game/ai.js` no misafidy hetsika ho an'ny AI.
- Ny `game/vela.js` sy `game/vela-board.js` no mitantana ny dingana Vela.
- Ny `tests/` no misy ny fitsapana mandeha amin'ny `npm test`; GitHub Actions no mampandeha azy isaky ny fanovana.

## Filaharan'ny asa
1. Hamafiso ny fiafaran'ny lalao sy ny fitsipika manokana Riatra/Vela.
2. Andramo amin'ny finday ny safidy loko, ny zoom, ny AI ary ny lalao eo amin'ny écran iray.
3. Hatsarao tsikelikely ny AI sy ny fitsapana amin'ny toe-javatra sarotra.
4. Ampifandraiso sy andramo ny Supabase Auth, ny efitra sy chat; avy eo ampifanaraho amin'ny fomba azo antoka ny hetsika eo amin'ny solaitrabe.
5. Angony ny hevitra sy ny mpilalao liana, ary omanina ny rafitra fifaninanana.
6. Diniho ny lalàna sy ny saram-pandoavana alohan'ny hampidirana saram-pidirana na loka.

## Fiarovana sy fepetra
- Tsy mila API AI ivelany amin'izao ny AI mpifanandrina; mandeha ao amin'ny navigateur izy.
- Ny vokatra sy ny hetsika amin'ny lalao fifaninanana dia tokony hohamarinin'ny server.
- Tsy tokony hapetraka ao amin'ny frontend ny secret keys.
- Tsy tokony hisy fifaninanana misy saram-pidirana na loka vola raha tsy voamarina ny fepetra ara-dalàna sy ara-bola.
