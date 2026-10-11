# Fanorona Online 🇲🇬

Sehatra Fanorona malagasy an-tserasera — lalao, AI, Vela be ary fifaninanana.

## Toetry ny tetikasa
**Dingana ankehitriny: prototype azo lalaovina amin'ny fitaovana iray.** Afaka mifandimby milalao eo amin'ny navigateur ny olona roa; misy hetsika fototra, fakana amin'ny approach/withdrawal, fakana an-tery ary fakana maromaro. Mbola tsy misy multiplayer, kaonty na fandoavam-bola. Mila hamarinina amin'ny mpilalao mahay ny topology sy ny antsipirian'ny fitsipika alohan'ny hampiasana azy amin'ny tournoi.

## Hijery sy hanandrana
- Sokafy ny `index.html` amin'ny navigateur, na alefaso amin'ny static hosting toy ny GitHub Pages/Vercel.
- Ny `styles.css` no endrika responsive.
- Ny `app.js` no mitantana ny interface sy ny fifandimbiasan'ny mpilalao.
- Ny `game/engine.js` no mitahiry ny logic fototry ny lalao.
- Ny `tests/engine.test.js` no fitsapana mandeha amin'ny `npm test`; GitHub Actions no manandrana azy isaky ny push.

## Antontan-taratasy
- [Lalana fampandrosoana](docs/ROADMAP.md)
- [Fitsipika sy fitantanana fifaninanana](docs/TOURNAMENT_RULES.md)

## Filaharan'ny asa
1. Hamarino amin'ny fitsapana sy mpilalao mahay ny topology sy ny fitsipiky ny game engine.
2. Fenoy ny fitsapana amin'ny toe-javatra sarotra sy ny fiafaran'ny lalao.
3. Ampiharo ny Vela be sy ny scoring manokana amin'ny tournoi.
4. Ampidiro backend, kaonty, multiplayer ary tantaran'ny lalao.
5. Amboary ny fitantanana fifaninanana sy audit log.
6. Diniho ny lalàna sy ny saram-pandoavana alohan'ny hampidirana saram-pidirana na loka.

## Fiarovana
Ny vokatra sy ny hetsika amin'ny lalao tena izy dia tsy maintsy hamarinina ao amin'ny server. Tsy tokony hapetraka ao amin'ny frontend ny secret keys. Tsy tokony hisy fifaninanana misy saram-pidirana na loka vola raha tsy voamarina ny fepetra ara-dalàna sy ara-bola.
