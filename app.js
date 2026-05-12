const storageKey = "wikigyat-state-v1";
const state = JSON.parse(localStorage.getItem(storageKey)) || {
  users: [
    { id: "u1", username: "fitmaya", role: "creator" },
    { id: "u2", username: "beatleo", role: "creator" },
    { id: "u3", username: "fanalex", role: "subscriber" }
  ],
  creators: [
    {
      userId: "u1",
      displayName: "Fit Maya",
      bio: "Daily workouts and lifestyle content.",
      photo: "https://picsum.photos/100?1",
      cover: "https://picsum.photos/500/200?1",
      category: "fitness",
      region: "US",
      tiers: { basic: 9, premium: 19, vip: 49 }
    },
    {
      userId: "u2",
      displayName: "Beat Leo",
      bio: "Music producer behind-the-scenes videos.",
      photo: "https://picsum.photos/100?2",
      cover: "https://picsum.photos/500/200?2",
      category: "music",
      region: "EU",
      tiers: { basic: 8, premium: 15, vip: 35 }
    }
  ],
  subscriptions: [{ subscriberId: "u3", creatorId: "u1", tier: "basic", amount: 9 }],
  purchases: [{ subscriberId: "u3", postId: "p3", amount: 15 }],
  posts: [
    { id: "p1", creatorId: "u1", title: "Morning routine", type: "photo", price: 0, preview: "Warm-up preview", mediaUrl: "https://picsum.photos/600?11" },
    { id: "p2", creatorId: "u1", title: "Core workout", type: "video", price: 0, preview: "Subscribers only workout", mediaUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4" },
    { id: "p3", creatorId: "u1", title: "Exclusive transformation", type: "photo", price: 15, preview: "PPV transformation set", mediaUrl: "https://picsum.photos/600?12" },
    { id: "p4", creatorId: "u2", title: "Studio session", type: "video", price: 0, preview: "Beat-making preview", mediaUrl: "https://samplelib.com/lib/preview/mp4/sample-10s.mp4" }
  ],
  messages: [{ fromId: "u3", toId: "u1", body: "Loved your content!", at: new Date().toISOString() }],
  payouts: [{ creatorId: "u1", amount: 120, date: "2026-04-29" }, { creatorId: "u2", amount: 80, date: "2026-04-30" }]
};

let session = JSON.parse(localStorage.getItem("wikigyat-session"));
let selectedCreatorId = state.creators[0]?.userId;

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
  localStorage.setItem("wikigyat-session", JSON.stringify(session));
}

function esc(value) {
  return String(value || "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}

function byId(id) { return document.getElementById(id); }

const authForm = byId("auth-form");
authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const mode = e.submitter?.dataset.mode;
  const username = byId("username").value.trim();
  const role = byId("role").value;
  if (!username) return;

  let user = state.users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (mode === "signup" && user) return alert("Username already exists.");
  if (mode === "login" && !user) return alert("User not found. Sign up first.");

  if (mode === "signup") {
    user = { id: `u${Date.now()}`, username, role };
    state.users.push(user);
    if (role === "creator") {
      state.creators.push({
        userId: user.id,
        displayName: username,
        bio: "",
        photo: "",
        cover: "",
        category: "general",
        region: "global",
        tiers: { basic: 5, premium: 10, vip: 20 }
      });
    }
  }

  session = { userId: user.id };
  save();
  render();
});

byId("logout").addEventListener("click", () => {
  session = null;
  save();
  render();
});

function currentUser() { return state.users.find((u) => u.id === session?.userId); }
function creatorProfile(id) { return state.creators.find((c) => c.userId === id); }
function isSubscribed(subscriberId, creatorId) { return state.subscriptions.some((s) => s.subscriberId === subscriberId && s.creatorId === creatorId); }
function hasPPV(subscriberId, postId) { return state.purchases.some((p) => p.subscriberId === subscriberId && p.postId === postId); }

function renderFeatured() {
  byId("featured-creators").innerHTML = state.creators.slice(0, 3).map((c) => `<span>${esc(c.displayName)}</span>`).join("");
}

function renderDiscovery(user) {
  const term = byId("search-term").value.toLowerCase();
  const category = byId("search-category").value;
  const region = byId("search-region").value;
  const sort = byId("search-sort").value;
  const categories = [...new Set(state.creators.map((c) => c.category).filter(Boolean))];
  const regions = [...new Set(state.creators.map((c) => c.region).filter(Boolean))];
  byId("search-category").innerHTML = `<option value="all">All categories</option>${categories.map((c) => `<option ${c === category ? "selected" : ""} value="${esc(c)}">${esc(c)}</option>`).join("")}`;
  byId("search-region").innerHTML = `<option value="all">All regions</option>${regions.map((r) => `<option ${r === region ? "selected" : ""} value="${esc(r)}">${esc(r)}</option>`).join("")}`;

  const creators = [...state.creators]
    .filter((c) => (category === "all" || c.category === category) && (region === "all" || c.region === region) && (c.displayName.toLowerCase().includes(term) || c.bio.toLowerCase().includes(term)))
    .sort((a, b) => sort === "name" ? a.displayName.localeCompare(b.displayName) : state.subscriptions.filter((s) => s.creatorId === b.userId).length - state.subscriptions.filter((s) => s.creatorId === a.userId).length);

  byId("creator-list").innerHTML = creators.map((c) => {
    const subCount = state.subscriptions.filter((s) => s.creatorId === c.userId).length;
    const subscribed = isSubscribed(user.id, c.userId);
    return `<article class="card">
      <img class="cover" src="${esc(c.cover || "https://picsum.photos/500/200")}" alt="cover" />
      <div class="row"><img class="avatar" src="${esc(c.photo || "https://picsum.photos/80")}" alt="avatar" /><strong>${esc(c.displayName)}</strong></div>
      <p>${esc(c.bio)}</p>
      <p>${esc(c.category)} · ${esc(c.region)} · ${subCount} subscribers</p>
      <p>Tiers: Basic $${c.tiers.basic} / Premium $${c.tiers.premium} / VIP $${c.tiers.vip}</p>
      <div class="row wrap">
        <button data-view="${c.userId}">Open profile</button>
        <select data-tier="${c.userId}">
          <option value="basic">Basic</option><option value="premium">Premium</option><option value="vip">VIP</option>
        </select>
        <button ${subscribed ? "disabled" : ""} data-subscribe="${c.userId}">${subscribed ? "Subscribed" : "Subscribe"}</button>
      </div>
    </article>`;
  }).join("");

  byId("creator-list").querySelectorAll("button[data-view]").forEach((btn) => {
    btn.onclick = () => {
      selectedCreatorId = btn.dataset.view;
      renderFeed(user);
    };
  });

  byId("creator-list").querySelectorAll("button[data-subscribe]").forEach((btn) => {
    btn.onclick = () => {
      const creatorId = btn.dataset.subscribe;
      const tier = byId("creator-list").querySelector(`select[data-tier='${creatorId}']`).value;
      const creator = creatorProfile(creatorId);
      state.subscriptions.push({ subscriberId: user.id, creatorId, tier, amount: creator.tiers[tier] });
      save();
      render();
    };
  });

  const options = state.creators.filter((c) => isSubscribed(user.id, c.userId)).map((c) => `<option value="${c.userId}">${esc(c.displayName)}</option>`).join("");
  byId("dm-creator").innerHTML = options || "<option>No subscribed creators</option>";
}

function renderFeed(user) {
  const creator = creatorProfile(selectedCreatorId) || state.creators[0];
  if (!creator) return;
  selectedCreatorId = creator.userId;

  byId("creator-detail").innerHTML = `<article class="card">
    <img class="cover" src="${esc(creator.cover || "https://picsum.photos/500/200")}" alt="cover" />
    <div class="row"><img class="avatar" src="${esc(creator.photo || "https://picsum.photos/80")}" alt="avatar" /><strong>${esc(creator.displayName)}</strong></div>
    <p>${esc(creator.bio)}</p>
    <p>Category: ${esc(creator.category)} · Region: ${esc(creator.region)}</p>
  </article>`;

  const subscribed = isSubscribed(user.id, creator.userId);
  const posts = state.posts.filter((p) => p.creatorId === creator.userId);
  byId("feed").innerHTML = posts.map((p) => {
    const unlocked = subscribed || p.price === 0 || hasPPV(user.id, p.id);
    const isVideo = p.type === "video";
    const media = unlocked
      ? isVideo
        ? `<video class="media" controls src="${esc(p.mediaUrl)}"></video>`
        : `<img class="media" src="${esc(p.mediaUrl)}" alt="${esc(p.title)}" />`
      : `<div class="card lock">🔒 ${esc(p.preview || "Locked preview")}. ${p.price > 0 ? `Buy PPV for $${p.price}` : "Subscribe to unlock"}.</div>`;
    return `<article class="card">
      <h4>${esc(p.title)} (${esc(p.type)})</h4>
      ${media}
      ${!unlocked && p.price > 0 ? `<button data-ppv="${p.id}">Buy PPV $${p.price}</button>` : ""}
    </article>`;
  }).join("");

  byId("feed").querySelectorAll("button[data-ppv]").forEach((btn) => {
    btn.onclick = () => {
      const post = state.posts.find((p) => p.id === btn.dataset.ppv);
      state.purchases.push({ subscriberId: user.id, postId: post.id, amount: post.price });
      save();
      renderFeed(user);
    };
  });

  renderDMThread(user);
}

byId("send-dm").onclick = () => {
  const user = currentUser();
  if (!user || user.role !== "subscriber") return;
  const creatorId = byId("dm-creator").value;
  const body = byId("dm-text").value.trim();
  if (!body || !isSubscribed(user.id, creatorId)) return alert("Subscribe first to message this creator.");
  state.messages.push({ fromId: user.id, toId: creatorId, body, at: new Date().toISOString() });
  byId("dm-text").value = "";
  save();
  renderDMThread(user);
};

byId("dm-creator").onchange = () => {
  const user = currentUser();
  if (user) renderDMThread(user);
};

function renderDMThread(user) {
  if (user.role !== "subscriber") return;
  const creatorId = byId("dm-creator").value;
  const rows = state.messages
    .filter((m) => (m.fromId === user.id && m.toId === creatorId) || (m.fromId === creatorId && m.toId === user.id))
    .map((m) => `<p><strong>${m.fromId === user.id ? "You" : esc(creatorProfile(creatorId)?.displayName)}</strong>: ${esc(m.body)}</p>`)
    .join("");
  byId("dm-thread").innerHTML = rows || "<p>No messages yet.</p>";
}

const profileForm = byId("creator-profile-form");
profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const user = currentUser();
  if (!user || user.role !== "creator") return;
  const creator = creatorProfile(user.id);
  Object.assign(creator, {
    displayName: byId("creator-name").value.trim(),
    bio: byId("creator-bio").value.trim(),
    photo: byId("creator-photo").value.trim(),
    cover: byId("creator-cover").value.trim(),
    category: byId("creator-category").value.trim() || "general",
    region: byId("creator-region").value.trim() || "global",
    tiers: {
      basic: Number(byId("tier-basic").value),
      premium: Number(byId("tier-premium").value),
      vip: Number(byId("tier-vip").value)
    }
  });
  save();
  render();
});

byId("media-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const user = currentUser();
  if (!user || user.role !== "creator") return;
  const file = byId("media-file").files[0];
  const mediaUrl = file ? URL.createObjectURL(file) : (byId("media-type").value === "photo" ? "https://picsum.photos/600" : "https://samplelib.com/lib/preview/mp4/sample-5s.mp4");
  state.posts.unshift({
    id: `p${Date.now()}`,
    creatorId: user.id,
    title: byId("media-title").value.trim(),
    type: byId("media-type").value,
    price: Number(byId("media-price").value),
    preview: byId("media-preview").value.trim() || "Exclusive preview",
    mediaUrl
  });
  byId("media-form").reset();
  save();
  render();
});

function renderCreator(user) {
  const creator = creatorProfile(user.id);
  if (!creator) return;
  byId("creator-name").value = creator.displayName || "";
  byId("creator-bio").value = creator.bio || "";
  byId("creator-photo").value = creator.photo || "";
  byId("creator-cover").value = creator.cover || "";
  byId("creator-category").value = creator.category || "";
  byId("creator-region").value = creator.region || "";
  byId("tier-basic").value = creator.tiers.basic;
  byId("tier-premium").value = creator.tiers.premium;
  byId("tier-vip").value = creator.tiers.vip;

  const posts = state.posts.filter((p) => p.creatorId === user.id);
  byId("creator-gallery").innerHTML = posts.map((p) => `<article class="card"><strong>${esc(p.title)}</strong><p>${esc(p.type)} · ${p.price > 0 ? `$${p.price} PPV` : "Subscription feed"}</p></article>`).join("") || "<p>No posts yet.</p>";

  const subs = state.subscriptions.filter((s) => s.creatorId === user.id);
  const ppv = state.purchases.filter((x) => state.posts.find((p) => p.id === x.postId && p.creatorId === user.id));
  const subRevenue = subs.reduce((acc, s) => acc + s.amount, 0);
  const ppvRevenue = ppv.reduce((acc, p) => acc + p.amount, 0);
  byId("wallet").innerHTML = `<div class="grid">
    <article class="card"><h4>Total revenue</h4><p>$${subRevenue + ppvRevenue}</p></article>
    <article class="card"><h4>Subscriber count</h4><p>${subs.length}</p></article>
    <article class="card"><h4>PPV sales</h4><p>$${ppvRevenue}</p></article>
  </div>`;

  byId("payouts").innerHTML = state.payouts.filter((p) => p.creatorId === user.id).map((p) => `<li>${esc(p.date)} — $${p.amount}</li>`).join("") || "<li>No payouts yet.</li>";

  byId("creator-messages").innerHTML = state.messages
    .filter((m) => m.toId === user.id || m.fromId === user.id)
    .map((m) => {
      const from = state.users.find((u) => u.id === m.fromId)?.username || "unknown";
      const to = state.users.find((u) => u.id === m.toId)?.username || "unknown";
      return `<p><strong>${esc(from)}</strong> → <strong>${esc(to)}</strong>: ${esc(m.body)}</p>`;
    })
    .join("") || "<p>No messages yet.</p>";
}

function render() {
  renderFeatured();
  const user = currentUser();
  byId("auth-section").classList.toggle("hidden", !!user);
  byId("app-section").classList.toggle("hidden", !user);
  if (!user) return;

  byId("session-title").textContent = `Logged in as ${user.username} (${user.role})`;
  const isSubscriber = user.role === "subscriber";
  byId("subscriber-view").classList.toggle("hidden", !isSubscriber);
  byId("creator-view").classList.toggle("hidden", isSubscriber);

  if (isSubscriber) {
    renderDiscovery(user);
    renderFeed(user);
  } else {
    renderCreator(user);
  }
}

["search-term", "search-category", "search-region", "search-sort"].forEach((id) => byId(id).addEventListener("input", () => {
  const user = currentUser();
  if (user?.role === "subscriber") renderDiscovery(user);
}));

render();
