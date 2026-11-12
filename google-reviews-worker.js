// Cloudflare Worker: отдаёт отзывы Google для «ІДЕАЛЬНО» в формате виджета на сайте.
// Деплой: wrangler deploy, затем секрет: wrangler secret put GOOGLE_API_KEY
// (ключ с включённым Places API (New), ограничь его по API и по IP/реферу).
//
// На сайте вместо статичного массива REVIEWS:
//   fetch('https://<твой-worker>.workers.dev/')
//     .then(r => r.json())
//     .then(d => { track.innerHTML = ...d.reviews.map(card) ... ; gscore/gcount = d.rating / d.count });

const PLACE_ID = "ChIJKYwKrU8zxkARGYNoNeg66zc"; // ІДЕАЛЬНО, Одеса
const CACHE_SECONDS = 6 * 60 * 60;               // Google не любит частые запросы, 6 часов достаточно
const ALLOWED_ORIGIN = "*";                       // замени на домен сайта, например https://idealno.od.ua

export default {
  async fetch(request, env, ctx) {
    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).origin + "/reviews");
    let res = await cache.match(cacheKey);
    if (res) return withCors(res);

    const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?languageCode=uk`;
    const g = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": env.GOOGLE_API_KEY,
        "X-Goog-FieldMask": "rating,userRatingCount,reviews",
      },
    });
    if (!g.ok) {
      return withCors(new Response(JSON.stringify({ error: "google", status: g.status }), {
        status: 502, headers: { "content-type": "application/json" },
      }));
    }
    const data = await g.json();

    const body = {
      rating: data.rating ?? null,
      count: data.userRatingCount ?? null,
      // Google отдаёт до 5 отзывов. Поля совпадают с тем, что ждёт card() на сайте.
      reviews: (data.reviews || []).map(r => ({
        name: r.authorAttribution?.displayName || null,
        photo: r.authorAttribution?.photoUri || null,
        profile: r.authorAttribution?.uri || null,
        time: r.relativePublishTimeDescription || null,
        rating: r.rating ?? 5,
        t: r.text?.text || r.originalText?.text || "",
      })),
    };

    res = new Response(JSON.stringify(body), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": `public, max-age=${CACHE_SECONDS}`,
      },
    });
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return withCors(res);
  },
};

function withCors(res) {
  const r = new Response(res.body, res);
  r.headers.set("access-control-allow-origin", ALLOWED_ORIGIN);
  return r;
}
