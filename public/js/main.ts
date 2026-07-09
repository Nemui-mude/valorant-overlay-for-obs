import type { ApiResponse } from "../../types/types";

const PARAMS = new URLSearchParams(location.search);
const PLATFORM = PARAMS.get("platform") ?? "pc";
const REGION = PARAMS.get("region") ?? "null";
const RAW_NAME = PARAMS.get("name") ?? "null";
const RAW_TAG = PARAMS.get("tag") ?? "null";
let LOCALE = PARAMS.get("lang") || "";

// browser language or ja
if (!LOCALE) {
  const browserLang = navigator.language?.slice(0, 2);
  LOCALE = ["ja", "en", "de", "ko"].includes(browserLang) ? browserLang : "ja";
}

const POLL_MS = 900000;
const NAME = encodeURIComponent(RAW_NAME ?? "");
const TAG = encodeURIComponent(RAW_TAG ?? "");

const errorBlock = document.querySelector(".error_block");
const errorText = document.querySelector(".error_text");
const rankBlockEl = document.getElementById("rank_block");
const rankTitleEl = document.querySelector('[data-i18n="match.recentTitle"]');
const rankEl = document.getElementById("rank");
const rrEl = document.getElementById("rr");
const winEl = document.getElementById("win");
const loseEl = document.getElementById("lose");
const agentBlockEl = document.getElementById("agent_block");
const agentInfoEl = document.querySelector(".agent_info");

function showStateMessage(message: string) {
  if (errorBlock && errorText) {
    errorBlock.classList.add("visible");
    errorText.textContent = message;
  }
}

/**
 * update rank ui
 * @param res - API response
 */
function updateRankUI(res: ApiResponse) {
  const rankImageEl = document.getElementById("rankImage") as HTMLImageElement;

  if (rankEl) rankEl.textContent = res.rank.tier.name;
  if (rrEl) rrEl.textContent = `${res.rank.rr} RR`;
  if (res.rank.imageUrl && rankImageEl) {
    rankImageEl.src = res.rank.imageUrl;
  }

  if (rankBlockEl) {
    rankBlockEl.classList.add("visible");
  }
}

/**
 * update match ui
 * @param res - API response
 */
function updateMatchUI(res: ApiResponse) {
  const now = new Date();
  const todayMatches = res.matches.filter(
    (match) => match.date === now.toDateString(),
  );

  const winCount = todayMatches.filter((match) => match.isWin).length;
  const loseCount = todayMatches.filter((match) => !match.isWin).length;

  // update win/lose ui
  if (winEl) winEl.textContent = `${winCount}${res.ui.winSuffix}`;
  if (loseEl) loseEl.textContent = `${loseCount}${res.ui.loseSuffix}`;

  // update agent ui
  if (agentInfoEl && todayMatches.length !== 0 && res.agentVisible) {
    agentBlockEl?.classList.remove("visible");
    agentInfoEl.innerHTML = "";
    todayMatches
      .slice(0, 10)
      .reverse()
      .forEach((match) => {
        const agent = match.agent;
        if (!agent || !agent.id) return;

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

/**
 * display overlay
 */
async function displayOverlay(): Promise<void> {
  try {
    const url = `/api/overlay/${PLATFORM}/${REGION}/${NAME}/${TAG}?lang=${LOCALE}`;
    const res = await fetch(url);
    const data = await res.json();

    // invalid request
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
  } catch (error: unknown) {
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
