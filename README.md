# Mediamesto / Tilda + GitHub

Tilda остаётся основной страницей. GitHub хранит CSS, JS и материалы.

GitHub Pages:

```text
https://stebunov22.github.io/mediamesto/
```

## Что лежит в репозитории

```text
index.html                  # техническая страница репозитория
assets/css/site.css          # стили главной страницы
assets/js/site.js            # скрипты главной страницы
assets/materials/logos/      # логотипы
assets/materials/photos/     # фото и изображения
assets/materials/videos/     # видео
assets/materials/documents/  # документы
assets/materials/other/      # прочие материалы
pages/main/body.html         # резервная копия HTML тела главной страницы
pages/blog/                  # заготовка под страницу блога
pages/cases/                 # заготовка под страницу кейсов
```

## Подключение к Tilda

CSS:

```html
<link rel="stylesheet" href="https://stebunov22.github.io/mediamesto/assets/css/site.css?v=20260625-3">
```

JS:

```html
<script src="https://stebunov22.github.io/mediamesto/assets/js/site.js?v=20260625-3"></script>
```

## Важные ссылки в коде

- Блок кейсов, кнопка «Смотреть все»: `https://mediamesto.ru/cases`
- Блог, кнопка «Смотреть все»: `https://mediamesto.ru/blog`
- Политика конфиденциальности: `http://mediamesto.ru/privacy-policy`

## Как обновлять версию

При правках CSS/JS меняйте параметр `v=`, например `20260625-3` → `20260625-4`. Это сбрасывает кеш браузера.
