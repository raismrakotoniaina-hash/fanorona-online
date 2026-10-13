import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = (id) => document.getElementById(id);
const statusEl = $("online-status");
const authForm = $("online-auth-form");
const emailEl = $("online-email");
const passwordEl = $("online-password");
const nameEl = $("online-display-name");
const signUpButton = $("online-signup");
const signInButton = $("online-signin");
const signOutButton = $("online-signout");
const createRoomButton = $("online-create-room");
const joinRoomButton = $("online-join-room");
const roomCodeEl = $("online-room-code-input");
const roomCodeDisplay = $("online-room-code");
const roomPanel = $("online-room-panel");
const chatForm = $("online-chat-form");
const chatInput = $("online-chat-input");
const chatList = $("online-chat-list");
const roomStatusEl = $("online-room-status");
const startGameButton = $("online-start-game");
const gameStatusEl = $("online-game-status");
let onlineGameActive = false;
let publishingGameState = false;
let lastPublishedGameState = "";
let lastBoardSignature = "";

function boardSignature(state) {
  return JSON.stringify({
    board: state?.board,
    turn: state?.turn,
    gameOver: state?.gameOver,
    turnContext: state?.turnContext,
    velaSession: state?.velaSession,
    velaOfferedIndex: state?.velaOfferedIndex,
    turnHadCapture: state?.turnHadCapture
  });
}

let currentUser = null;
let currentRoom = null;
let roomChannel = null;
let messageChannel = null;
let busy = false;

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.dataset.state = isError ? "error" : "ok";
}
function setRoomStatus(message) {
  if (roomStatusEl) roomStatusEl.textContent = message;
}
function setBusy(value) {
  busy = value;
  [signUpButton, signInButton, signOutButton, createRoomButton, joinRoomButton].forEach((button) => {
    if (button) button.disabled = value;
  });
}
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}
function renderAuth() {
  const loggedIn = Boolean(currentUser);
  if ($("online-auth-fields")) $("online-auth-fields").hidden = loggedIn;
  if (signOutButton) signOutButton.hidden = !loggedIn;
  if ($("online-account-label")) {
    $("online-account-label").textContent = loggedIn
      ? "Kaonty: " + (currentUser.email || currentUser.id)
      : "Tsy mbola tafiditra";
  }
  if ($("online-room-controls")) $("online-room-controls").hidden = !loggedIn;
}
function renderRoom() {
  if (!roomPanel) return;
  roomPanel.hidden = !currentRoom;
  if (!currentRoom) return;
  if (roomCodeDisplay) roomCodeDisplay.textContent = currentRoom.room_code;
  setRoomStatus(currentRoom.status === "playing"
    ? "Mpilalao roa no tafiditra. Efitra vonona."
    : "Miandry mpilalao faharoa…");
  if (startGameButton) startGameButton.hidden = currentRoom.status !== "playing";
}
function renderMessage(message) {
  if (!chatList) return;
  const item = document.createElement("div");
  item.className = "online-chat-message";
  const author = document.createElement("strong");
  author.textContent = message.sender_id === currentUser?.id ? "Ianao" : "Mpilalao";
  const body = document.createElement("p");
  body.textContent = message.message;
  const time = document.createElement("small");
  time.textContent = message.created_at ? new Date(message.created_at).toLocaleTimeString() : "";
  item.append(author, body, time);
  chatList.appendChild(item);
  chatList.scrollTop = chatList.scrollHeight;
}
async function stopRoomSubscriptions() {
  if (roomChannel) await supabase.removeChannel(roomChannel);
  if (messageChannel) await supabase.removeChannel(messageChannel);
  roomChannel = null;
  messageChannel = null;
}
async function openRoom(room) {
  await stopRoomSubscriptions();
  currentRoom = room;
  renderRoom();
  const { data: messages, error } = await supabase
    .from("game_messages")
    .select("id,room_id,sender_id,message,created_at")
    .eq("room_id", room.id)
    .order("created_at", { ascending: true })
    .limit(100);
  if (error) setRoomStatus("Efitra voasokatra, fa tsy afaka mamaky ny hafatra: " + error.message);
  else {
    chatList.replaceChildren();
    (messages || []).forEach(renderMessage);
  }
  roomChannel = supabase.channel("fanorona-room-" + room.id)
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_rooms", filter: "id=eq." + room.id }, (payload) => {
      currentRoom = payload.new;
      renderRoom();
      const state = payload.new.game_state;
      if (state?.online && Array.isArray(state.board) && window.fanoronaGame) {
        const incoming = JSON.stringify(state);
        const incomingSignature = boardSignature(state);
        const color = payload.new.host_id === currentUser?.id ? "light" : "dark";
        if (!onlineGameActive) {
          onlineGameActive = true;
          lastBoardSignature = incomingSignature;
          window.fanoronaGame.enableOnline(color);
          if (gameStatusEl) gameStatusEl.textContent = "Lalao an-tserasera nanomboka. Ianao milalao amin’ny vato " + (color === "light" ? "fotsy." : "mainty.");
          document.getElementById("lalao")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        const localSignature = boardSignature(window.fanoronaGame.snapshot());
        lastBoardSignature = incomingSignature;
        if (incomingSignature !== localSignature) window.fanoronaGame.applyRemoteState(state);
        lastPublishedGameState = incoming;
      }
    })
    .subscribe();
  messageChannel = supabase.channel("fanorona-messages-" + room.id)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "game_messages", filter: "room_id=eq." + room.id }, (payload) => {
      if (payload.new.sender_id !== currentUser?.id) renderMessage(payload.new);
    })
    .subscribe();
}
function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => chars[value % chars.length]).join("");
}
async function createRoom() {
  if (!currentUser || busy) return;
  setBusy(true);
  try {
    let room = null;
    let error = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const result = await supabase.from("game_rooms").insert({
        room_code: makeRoomCode(),
        host_id: currentUser.id,
        status: "waiting",
        current_turn: currentUser.id,
        game_state: { board: null, turn: "light", version: 1 }
      }).select("*").single();
      room = result.data;
      error = result.error;
      if (!error) break;
      if (!String(error.code || "").includes("23505")) break;
    }
    if (error) throw error;
    await openRoom(room);
    setStatus("Vita ny efitra. Alefaso amin'ny namanao ny kaody.");
  } catch (error) {
    setStatus("Tsy afaka namorona efitra: " + (error.message || "Hadisoana tsy fantatra"), true);
  } finally { setBusy(false); }
}
async function joinRoom() {
  if (!currentUser || busy) return;
  const code = (roomCodeEl?.value || "").trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) {
    setStatus("Ampidiro ny kaody efitra misy litera na isa 6.", true);
    return;
  }
  setBusy(true);
  try {
    const found = await supabase.from("game_rooms").select("*").eq("room_code", code).eq("status", "waiting").is("guest_id", null).maybeSingle();
    if (found.error) throw found.error;
    if (!found.data) throw new Error("Tsy hita ilay efitra na efa feno. Hamarino ny kaody.");
    if (found.data.host_id === currentUser.id) throw new Error("Ianao no namorona ity efitra ity; alefaso amin'ny namana ilay kaody.");
    const joined = await supabase.from("game_rooms")
      .update({ guest_id: currentUser.id, status: "playing" })
      .eq("id", found.data.id)
      .eq("status", "waiting")
      .is("guest_id", null)
      .select("*").single();
    if (joined.error) throw joined.error;
    await openRoom(joined.data);
    setStatus("Tafiditra ao amin'ny efitra ianao.");
  } catch (error) {
    setStatus("Tsy tafiditra: " + (error.message || "Hadisoana tsy fantatra"), true);
  } finally { setBusy(false); }
}
if (authForm) {
  authForm.addEventListener("submit", (event) => event.preventDefault());
}
if (signUpButton) signUpButton.addEventListener("click", async () => {
  if (busy) return;
  const email = (emailEl?.value || "").trim();
  const password = passwordEl?.value || "";
  const displayName = (nameEl?.value || "").trim();
  if (!email || password.length < 8) return setStatus("Ampidiro ny email ary tenimiafina 8 tarehintsoratra farafahakeliny.", true);
  setBusy(true);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Return confirmation links to the GitHub Pages project path, not the domain root.
        emailRedirectTo: "https://raismrakotoniaina-hash.github.io/fanorona-online/",
        data: { display_name: displayName }
      }
    });
    if (error) throw error;
    if (data.session) setStatus("Vita ny kaonty ary tafiditra ianao.");
    else setStatus("Vita ny fangatahana kaonty. Jereo ny email hanamafisana azy, raha takian'ny Supabase.");
  } catch (error) { setStatus("Tsy nahomby ny famoronana kaonty: " + error.message, true); }
  finally { setBusy(false); }
});
if (signInButton) signInButton.addEventListener("click", async () => {
  if (busy) return;
  const email = (emailEl?.value || "").trim();
  const password = passwordEl?.value || "";
  if (!email || !password) return setStatus("Ampidiro ny email sy tenimiafina.", true);
  setBusy(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setStatus("Tafiditra soa aman-tsara.");
  } catch (error) { setStatus("Tsy tafiditra: " + error.message, true); }
  finally { setBusy(false); }
});
if (signOutButton) signOutButton.addEventListener("click", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) setStatus("Tsy afaka nivoaka: " + error.message, true);
  else {
    currentUser = null;
    currentRoom = null;
    await stopRoomSubscriptions();
    renderAuth(); renderRoom();
    setStatus("Nivoaka ny kaonty.");
  }
});
if (createRoomButton) createRoomButton.addEventListener("click", createRoom);

if (startGameButton) startGameButton.addEventListener("click", async () => {
  if (!currentUser || !currentRoom || currentRoom.status !== "playing" || busy) {
    if (gameStatusEl) gameStatusEl.textContent = "Mila mpilalao roa ao amin’ny efitra vao manomboka.";
    return;
  }
  if (!window.fanoronaGame) {
    if (gameStatusEl) gameStatusEl.textContent = "Tsy mbola vonona ny solaitrabe. Avereno alefa ny pejy.";
    return;
  }
  setBusy(true);
  try {
    const color = currentRoom.host_id === currentUser.id ? "light" : "dark";
    const state = { ...window.fanoronaGame.snapshot(), online: true, revision: 1, startedBy: currentUser.id };
    const { error } = await supabase.from("game_rooms").update({ game_state: state }).eq("id", currentRoom.id);
    if (error) throw error;
    onlineGameActive = true;
    lastPublishedGameState = JSON.stringify(state);
    lastBoardSignature = boardSignature(state);
    window.fanoronaGame.enableOnline(color);
    if (gameStatusEl) gameStatusEl.textContent = "Nanomboka ny lalao. Ianao milalao amin’ny vato " + (color === "light" ? "fotsy." : "mainty.");
    document.getElementById("lalao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    if (gameStatusEl) gameStatusEl.textContent = "Tsy afaka nanomboka ny lalao: " + (error.message || "Hadisoana tsy fantatra");
  } finally { setBusy(false); }
});

window.addEventListener("fanorona:board-state", async (event) => {
  if (!onlineGameActive || !currentRoom || !currentUser || publishingGameState) return;
  const snapshot = event.detail;
  if (!snapshot || !Array.isArray(snapshot.board)) return;
  const state = { ...snapshot, online: true, revision: Number(currentRoom.game_state?.revision || 0) + 1, updatedBy: currentUser.id };
  const signature = boardSignature(state);
  if (signature === lastBoardSignature) return;
  lastBoardSignature = signature;
  const serialized = JSON.stringify(state);
  publishingGameState = true;
  lastPublishedGameState = serialized;
  try {
    const { error } = await supabase.from("game_rooms").update({ game_state: state }).eq("id", currentRoom.id);
    if (error) {
      lastPublishedGameState = "";
      if (gameStatusEl) gameStatusEl.textContent = "Tsy voatahiry ny hetsika: " + error.message;
    } else {
      currentRoom.game_state = state;
    }
  } catch (error) {
    lastPublishedGameState = "";
    if (gameStatusEl) gameStatusEl.textContent = "Nisy olana tamin’ny fandefasana ny hetsika: " + (error.message || "Hadisoana");
  } finally { publishingGameState = false; }
});

if (joinRoomButton) joinRoomButton.addEventListener("click", joinRoom);
if (chatForm) chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || !currentRoom) return setStatus("Midira ary mamoròna na midira efitra aloha.", true);
  const message = (chatInput?.value || "").trim();
  if (!message) return;
  if (message.length > 1000) return setStatus("Fohy kokoa noho ny 1000 tarehintsoratra ny hafatra.", true);
  const { error } = await supabase.from("game_messages").insert({
    room_id: currentRoom.id, sender_id: currentUser.id, message
  });
  if (error) setStatus("Tsy afaka nandefa hafatra: " + error.message, true);
  else {
    renderMessage({ sender_id: currentUser.id, message, created_at: new Date().toISOString() });
    chatInput.value = "";
  }
});
if ($("online-copy-code")) $("online-copy-code").addEventListener("click", async () => {
  if (!currentRoom) return;
  try {
    await navigator.clipboard.writeText(currentRoom.room_code);
    setStatus("Voadika ny kaody efitra.");
  } catch {
    setStatus("Kaody efitra: " + currentRoom.room_code);
  }
});
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user || null;
  renderAuth();
  if (currentUser) setStatus("Tafiditra: " + (currentUser.email || "kaonty Fanorona").trim());
});
const { data: authData, error: authError } = await supabase.auth.getSession();
if (authError) setStatus("Tsy afaka namaky ny session: " + authError.message, true);
currentUser = authData?.session?.user || null;
renderAuth();
renderRoom();
if (!currentUser) setStatus("Mamoròna kaonty na midira mba hilalao amin'ny Internet.");
