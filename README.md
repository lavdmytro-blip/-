# ІДЕАЛЬНО — сайт клінінгу (Одеса)

Односторінковий сайт без збирання: відкрий `index.html` у браузері або залий на будь-який хостинг
(GitHub Pages, Netlify, Cloudflare Pages, Vercel).

## Файли
- `index.html` — сайт (HTML + CSS + JS в одному файлі, шрифти з Google Fonts).
- `google-reviews-worker.js` — Cloudflare Worker, що віддає відгуки Google з ніками й аватарками.

## Підключити живі відгуки Google
1. У Google Cloud увімкни **Places API (New)** і створи API-ключ (обмеж його цим API).
2. `npm i -g wrangler`, у папці з воркером: `wrangler init` → підстав код з `google-reviews-worker.js`.
3. `wrangler secret put GOOGLE_API_KEY` → `wrangler deploy`.
4. В `index.html` заміни статичний `track.innerHTML=...` на:

```js
fetch('https://<твій-worker>.workers.dev/')
  .then(r => r.json())
  .then(d => {
    if (!d.reviews?.length) return;
    const h = d.reviews.map(card).join('');
    track.innerHTML = h + h.replace(/<article class="gcard"/g, '<article class="gcard" aria-hidden="true"');
    if (d.rating) document.getElementById('gscore').textContent = d.rating.toFixed(1);
    if (d.count) document.getElementById('gcount').textContent = d.count;
  })
  .catch(() => {}); // при помилці лишаються статичні відгуки
```

## Що варто доробити перед запуском
- Ціни / калькулятор вартості (уточнити у власника).
- Форма заявки зараз лише формує текст для Viber/Telegram — підключити до Telegram-бота.
- Домен, favicon, Open Graph-картинка, Google Analytics / Meta Pixel.

## Слайдер «до / після» з реальними фото
1. Поклади два фото одного ракурсу в папку `img/` (горизонтальні, бажано 4:3, ~1200px завширшки, .jpg до 300 КБ).
2. В `index.html` знайди `const BA_PHOTOS` і впиши шляхи:
   `const BA_PHOTOS={before:'img/before.jpg', after:'img/after.jpg'};`
Поки фото не вказані, показується згенерована демо-сцена (плитка після ремонту).

## Фото на сайті
Усі фото лежать у `img/` (kitchen.jpg, bath.jpg, room.jpg, windows.jpg тощо). Щоб замінити на оригінали, поклади файл з тією ж назвою. Бажано від 1600 px по довшій стороні.
