// Service Worker — April's Agentic Learning
// Cache-first strategy for all site pages and notebooks

const CACHE = 'agentic-v3';
const BASE  = '/agentic-learning';

const PRECACHE = [
  BASE + '/',
  BASE + '/index.html',
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

// Install: cache everything
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => {
        // Cache each file individually so one failure doesn't block the rest
        return Promise.allSettled(
          PRECACHE.map(url =>
            cache.add(url).catch(err => console.warn('SW: failed to cache', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for same-origin, network-only for everything else
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip external resources (GitHub video releases, fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // Skip non-agentic-learning paths
  if (!url.pathname.startsWith(BASE)) return;

  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Serve from cache, update in background
        fetch(req).then(res => {
          if (res && res.ok) {
            caches.open(CACHE).then(c => c.put(req, res));
          }
        }).catch(() => {});
        return cached;
      }

      // Not in cache — fetch from network and cache it
      return fetch(req).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => {
        // Offline and not cached — return offline page if we have index
        if (req.destination === 'document') {
          return caches.match(BASE + '/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
