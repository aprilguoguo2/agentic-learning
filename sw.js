// Service Worker — April's Agentic Learning
// Cache-first strategy for pages/notebooks; on-demand video caching per course

const CACHE       = 'agentic-v4';
const VIDEO_CACHE = 'agentic-videos-v1';
const BASE        = '/agentic-learning';
const VIDEO_BASE  = 'https://github.com/aprilguoguo2/agentic-learning/releases/download/videos/';

const PRECACHE = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/cache.html',
  BASE + '/langchain.html',
  BASE + '/langgraph.html',
  BASE + '/deep-agent.html',
  BASE + '/deep-agent-research.html',
  BASE + '/video-ids.js',
  BASE + '/notebooks/lc_m1_foundational_models.html',
  BASE + '/notebooks/lc_m1_prompting.html',
  BASE + '/notebooks/lc_m1_tools.html',
  BASE + '/notebooks/lc_m1_web_search.html',
  BASE + '/notebooks/lc_m1_memory.html',
  BASE + '/notebooks/lc_m1_multimodal.html',
  BASE + '/notebooks/lc_m1_personal_chef.html',
  BASE + '/notebooks/lc_m2_mcp.html',
  BASE + '/notebooks/lc_m2_travel_agent.html',
  BASE + '/notebooks/lc_m2_runtime_context.html',
  BASE + '/notebooks/lc_m2_state.html',
  BASE + '/notebooks/lc_m2_multi_agent.html',
  BASE + '/notebooks/lc_m2_wedding_planners.html',
  BASE + '/notebooks/lc_m2_bonus_rag.html',
  BASE + '/notebooks/lc_m2_bonus_sql.html',
  BASE + '/notebooks/lc_m3_managing_messages.html',
  BASE + '/notebooks/lc_m3_hitl.html',
  BASE + '/notebooks/lc_m3_dynamic_models.html',
  BASE + '/notebooks/lc_m3_dynamic_prompts.html',
  BASE + '/notebooks/lc_m3_dynamic_tools.html',
  BASE + '/notebooks/lc_m3_email_agent.html',
  BASE + '/notebooks/lg_m0_basics.html',
  BASE + '/notebooks/lg_m1_simple_graph.html',
  BASE + '/notebooks/lg_m1_chain.html',
  BASE + '/notebooks/lg_m1_router.html',
  BASE + '/notebooks/lg_m1_agent.html',
  BASE + '/notebooks/lg_m1_agent_memory.html',
  BASE + '/notebooks/lg_m1_deployment.html',
  BASE + '/notebooks/lg_m2_state_schema.html',
  BASE + '/notebooks/lg_m2_state_reducers.html',
  BASE + '/notebooks/lg_m2_multiple_schemas.html',
  BASE + '/notebooks/lg_m2_trim_filter.html',
  BASE + '/notebooks/lg_m2_chatbot_summ.html',
  BASE + '/notebooks/lg_m2_chatbot_ext.html',
  BASE + '/notebooks/lg_m3_streaming.html',
  BASE + '/notebooks/lg_m3_breakpoints.html',
  BASE + '/notebooks/lg_m3_edit_state.html',
  BASE + '/notebooks/lg_m3_dyn_breaks.html',
  BASE + '/notebooks/lg_m3_time_travel.html',
  BASE + '/notebooks/lg_m4_parallel.html',
  BASE + '/notebooks/lg_m4_sub_graph.html',
  BASE + '/notebooks/lg_m4_map_reduce.html',
  BASE + '/notebooks/lg_m4_research_asst.html',
  BASE + '/notebooks/lg_m5_memory_store.html',
  BASE + '/notebooks/lg_m5_schema_profile.html',
  BASE + '/notebooks/lg_m5_schema_coll.html',
  BASE + '/notebooks/lg_m5_memory_agent.html',
  BASE + '/notebooks/lg_m6_creating.html',
  BASE + '/notebooks/lg_m6_connecting.html',
  BASE + '/notebooks/lg_m6_double_text.html',
  BASE + '/notebooks/lg_m6_assistant.html',
  BASE + '/notebooks/da_m2_create_agent.html',
  BASE + '/notebooks/da_m3_todo.html',
  BASE + '/notebooks/da_m4_files.html',
  BASE + '/notebooks/da_m5_subagents.html',
  BASE + '/notebooks/da_m6_full_agent.html',
  BASE + '/notebooks/dar_m2_scoping.html',
  BASE + '/notebooks/dar_m3_research.html',
  BASE + '/notebooks/dar_m4_mcp.html',
  BASE + '/notebooks/dar_m5_supervisor.html',
  BASE + '/notebooks/dar_m6_full_system.html',
];

// Video keys per course — must match GitHub Release filenames exactly
const COURSE_VIDEOS = {
  langchain: [
    'lc_m1_l1','lc_m1_l2','lc_m1_l3','lc_m1_l4','lc_m1_l5',
    'lc_m2_l1','lc_m2_l2','lc_m2_l3','lc_m2_l4',
    'lc_m3_l1','lc_m3_l2','lc_m3_l3','lc_m3_l4','lc_m3_l5','lc_m3_l6','lc_m3_conclusion',
  ],
  langgraph: [
    'lg_m1_l1','lg_m1_l2','lg_m1_l3','lg_m1_l4','lg_m1_l5','lg_m1_l6','lg_m1_l7','lg_m1_l8',
    'lg_m2_l1','lg_m2_l2','lg_m2_l3','lg_m2_l4','lg_m2_l5','lg_m2_l6',
    'lg_m3_l1','lg_m3_l2','lg_m3_l3','lg_m3_l4','lg_m3_l5',
    'lg_m4_l1','lg_m4_l2','lg_m4_l3','lg_m4_l4',
    'lg_m5_l1','lg_m5_l2','lg_m5_l3','lg_m5_l4','lg_m5_l5',
    'lg_m6_l1','lg_m6_l2','lg_m6_l3','lg_m6_l4','lg_m6_l5',
  ],
  deepagent: [
    'da_m1','da_m2','da_m3','da_m4','da_m5','da_m6','da_m7',
  ],
  deepresearch: [
    'dar_m1','dar_m2','dar_m3','dar_m4','dar_m5','dar_m6',
  ],
};

// ── Install ────────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache =>
        Promise.allSettled(
          PRECACHE.map(url =>
            cache.add(url).catch(err => console.warn('SW: failed to cache', url, err))
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

// ── Activate ───────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        // Keep current page cache and video cache; delete old versions
        keys
          .filter(k => k !== CACHE && k !== VIDEO_CACHE)
          .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Message: on-demand video caching ──────────────────────────────────────────
self.addEventListener('message', async e => {
  const { type, course } = e.data || {};

  if (type === 'CACHE_COURSE') {
    const keys = COURSE_VIDEOS[course];
    if (!keys) {
      e.source.postMessage({ type: 'CACHE_ERROR', course, message: 'Unknown course' });
      return;
    }
    // Always wipe the entire video cache first — only one course at a time
    await caches.delete(VIDEO_CACHE);
    const cache = await caches.open(VIDEO_CACHE);
    let done = 0;
    const total = keys.length;

    for (const key of keys) {
      const url = VIDEO_BASE + key + '.mp4';
      try {
        const res = await fetch(url);
        if (res.ok) await cache.put(url, res);
      } catch (err) {
        console.warn('SW: video cache failed', url, err);
      }
      done++;
      e.source.postMessage({ type: 'CACHE_PROGRESS', course, done, total, key });
    }
    e.source.postMessage({ type: 'CACHE_DONE', course });
  }

  if (type === 'CLEAR_VIDEOS') {
    await caches.delete(VIDEO_CACHE);
    e.source.postMessage({ type: 'CLEAR_DONE' });
  }

  if (type === 'GET_STATUS') {
    const cache = await caches.open(VIDEO_CACHE);
    const keys = await cache.keys();
    const cachedUrls = new Set(keys.map(r => r.url));
    // Find which course (if any) has all its videos cached
    let activeCourse = null;
    let activeDone = 0;
    for (const [courseId, videoKeys] of Object.entries(COURSE_VIDEOS)) {
      const matched = videoKeys.filter(k => cachedUrls.has(VIDEO_BASE + k + '.mp4')).length;
      if (matched > 0) {
        activeCourse = courseId;
        activeDone = matched;
        break; // only one course can be cached at a time
      }
    }
    e.source.postMessage({
      type: 'STATUS',
      activeCourse,
      activeDone,
      activeTotal: activeCourse ? COURSE_VIDEOS[activeCourse].length : 0,
    });
  }
});

// ── Fetch: cache-first for pages; video cache for GitHub Release MP4s ─────────
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Intercept GitHub Release video requests — serve from video cache if available
  if (url.hostname === 'github.com' && url.pathname.includes('/releases/download/videos/')) {
    e.respondWith(
      caches.open(VIDEO_CACHE).then(cache =>
        cache.match(req).then(cached => cached || fetch(req))
      )
    );
    return;
  }

  // Skip all other external resources
  if (url.origin !== self.location.origin) return;

  // Skip non-agentic-learning paths
  if (!url.pathname.startsWith(BASE)) return;

  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Serve from cache; refresh in background
        fetch(req).then(res => {
          if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res));
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then(res => {
        if (res && res.ok) {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
        }
        return res;
      }).catch(() => {
        if (req.destination === 'document') return caches.match(BASE + '/index.html');
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
