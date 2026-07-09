// public/js/main.ts
var PARAMS = new URLSearchParams(location.search);
var PLATFORM = PARAMS.get("platform") ?? "pc";
var REGION = PARAMS.get("region") ?? "null";
var RAW_NAME = PARAMS.get("name") ?? "null";
var RAW_TAG = PARAMS.get("tag") ?? "null";
var LOCALE = PARAMS.get("lang") || "";
if (!LOCALE) {
  const browserLang = navigator.language?.slice(0, 2);
  LOCALE = ["ja", "en", "de", "ko"].includes(browserLang) ? browserLang : "ja";
}
var POLL_MS = 900000;
var NAME = encodeURIComponent(RAW_NAME ?? "");
var TAG = encodeURIComponent(RAW_TAG ?? "");
var errorBlock = document.querySelector(".error_block");
var errorText = document.querySelector(".error_text");
var rankBlockEl = document.getElementById("rank_block");
var rankTitleEl = document.querySelector('[data-i18n="match.recentTitle"]');
var rankEl = document.getElementById("rank");
var rrEl = document.getElementById("rr");
var winEl = document.getElementById("win");
var loseEl = document.getElementById("lose");
var agentBlockEl = document.getElementById("agent_block");
var agentInfoEl = document.querySelector(".agent_info");
function showStateMessage(message) {
  if (errorBlock && errorText) {
    errorBlock.classList.add("visible");
    errorText.textContent = message;
  }
}
function updateRankUI(res) {
  const rankImageEl = document.getElementById("rankImage");
  if (rankEl)
    rankEl.textContent = res.rank.tier.name;
  if (rrEl)
    rrEl.textContent = `${res.rank.rr} RR`;
  if (res.rank.imageUrl && rankImageEl) {
    rankImageEl.src = res.rank.imageUrl;
  }
  if (rankBlockEl) {
    rankBlockEl.classList.add("visible");
  }
}
function updateMatchUI(res) {
  const now = new Date;
  const todayMatches = res.matches.filter((match) => match.date === now.toDateString());
  const winCount = todayMatches.filter((match) => match.isWin).length;
  const loseCount = todayMatches.filter((match) => !match.isWin).length;
  if (winEl)
    winEl.textContent = `${winCount}${res.ui.winSuffix}`;
  if (loseEl)
    loseEl.textContent = `${loseCount}${res.ui.loseSuffix}`;
  if (agentInfoEl && todayMatches.length !== 0 && res.agentVisible) {
    agentBlockEl?.classList.remove("visible");
    agentInfoEl.innerHTML = "";
    todayMatches.slice(0, 10).reverse().forEach((match) => {
      const agent = match.agent;
      if (!agent || !agent.id)
        return;
      const itemEl = document.createElement("div");
      itemEl.className = `agent_item ${match.isWin ? "win" : "lose"}`;
      const imgEl = document.createElement("img");
      imgEl.src = `https://media.valorant-api.com/agents/${agent.id}/displayicon.png`;
      imgEl.alt = agent.name || "Agent";
      imgEl.title = agent.name || "Agent";
      itemEl.appendChild(imgEl);
      agentInfoEl.appendChild(itemEl);
    });
    agentBlockEl?.classList.add("visible");
  }
}
async function displayOverlay() {
  try {
    const url = `/api/overlay/${PLATFORM}/${REGION}/${NAME}/${TAG}?lang=${LOCALE}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === 400) {
      showStateMessage(data.message);
      return;
    }
    console.log(data);
    if (rankTitleEl) {
      rankTitleEl.textContent = data.ui.recentMatchesTitle;
    }
    updateRankUI(data);
    updateMatchUI(data);
  } catch (error) {
    if (error instanceof Error) {
      showStateMessage(error.message);
    }
  }
}
async function main() {
  document.documentElement.lang = LOCALE;
  displayOverlay();
  setInterval(() => displayOverlay(), POLL_MS);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
