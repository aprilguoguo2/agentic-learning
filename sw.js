const CACHE = 'agentic-learning-v1';

const PAGES = [
  '/',
  '/index.html',
  '/langchain.html',
  '/langgraph.html',
  '/deep-agent.html',
  '/deep-agent-research.html',
  '/video-ids.js',
  '/notebooks/lc_m1_foundational_models.html',
  '/notebooks/lc_m1_prompting.html',
  '/notebooks/lc_m1_tools.html',
  '/notebooks/lc_m1_web_search.html',
  '/notebooks/lc_m1_memory.html',
  '/notebooks/lc_m1_multimodal.html',
  '/notebooks/lc_m1_personal_chef.html',
  '/notebooks/lc_m2_mcp.html',
  '/notebooks/lc_m2_travel_agent.html',
  '/notebooks/lc_m2_runtime_context.html',
  '/notebooks/lc_m2_state.html',
  '/notebooks/lc_m2_multi_agent.html',
  '/notebooks/lc_m2_wedding_planners.html',
  '/notebooks/lc_m2_bonus_rag.html',
  '/notebooks/lc_m2_bonus_sql.html',
  '/notebooks/lc_m3_managing_messages.html',
  '/notebooks/lc_m3_hitl.html',
  '/notebooks/lc_m3_dynamic_models.html',
  '/notebooks/lc_m3_dynamic_prompts.html',
  '/notebooks/lc_m3_dynamic_tools.html',
  '/notebooks/lc_m3_email_agent.html',
  '/notebooks/lg_m0_basics.html',
  '/notebooks/lg_m1_simple_graph.html',
  '/notebooks/lg_m1_chain.html',
  '/notebooks/lg_m1_router.html',
  '/notebooks/lg_m1_agent.html',
  '/notebooks/lg_m1_agent_memory.html',
  '/notebooks/lg_m1_deployment.html',
  '/notebooks/lg_m2_state_schema.html',
  '/notebooks/lg_m2_state_reducers.html',
  '/notebooks/lg_m2_multiple_schemas.html',
  '/notebooks/lg_m2_trim_filter.html',
  '/notebooks/lg_m2_chatbot_summ.html',
  '/notebooks/lg_m2_chatbot_ext.html',
  '/notebooks/lg_m3_streaming.html',
  '/notebooks/lg_m3_breakpoints.html',
  '/notebooks/lg_m3_edit_state.html',
  '/notebooks/lg_m3_dyn_breaks.html',
  '/notebooks/lg_m3_time_travel.html',
  '/notebooks/lg_m4_parallel.html',
  '/notebooks/lg_m4_sub_graph.html',
  '/notebooks/lg_m4_map_reduce.html',
  '/notebooks/lg_m4_research_asst.html',
  '/notebooks/lg_m5_memory_store.html',
  '/notebooks/lg_m5_schema_profile.html',
  '/notebooks/lg_m5_schema_coll.html',
  '/notebooks/lg_m5_memory_agent.html',
  '/notebooks/lg_m6_creating.html',
  '/notebooks/lg_m6_connecting.html',
  '/notebooks/lg_m6_double_text.html',
  '/notebooks/lg_m6_assistant.html',
  '/notebooks/da_m2_create_agent.html',
  '/notebooks/da_m3_todo.html',
  '/notebooks/da_m4_files.html',
  '/notebooks/da_m5_subagents.html',
  '/notebooks/da_m6_full_agent.html',
  '/notebooks/dar_m2_scoping.html',
  '/notebooks/dar_m3_research.html',
  '/notebooks/dar_m4_mcp.html',
  '/notebooks/dar_m5_supervisor.html',
  '/notebooks/dar_m6_full_system.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PAGES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin HTML/JS
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
