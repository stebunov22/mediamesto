# MEDIAMESTO / GitHub files for Tilda

Tilda остаётся основной страницей. GitHub хранит только кодовые файлы.

## Структура

```
assets/css/site.css
assets/js/site.js
pages/main/body.html
pages/blog/.gitkeep
pages/cases/.gitkeep
index.html
README.md
```

Папка с материалами не добавляется: логотипы, фото и видео обновляются вручную.

## Подключение в Tilda

CSS в HEAD:

```html
<link rel="stylesheet" href="https://stebunov22.github.io/mediamesto/assets/css/site.css?v=20260625-5">
```

JS перед `</body>`:

```html
<script src="https://stebunov22.github.io/mediamesto/assets/js/site.js?v=20260625-5"></script>
```

## Что изменено в версии 20260625-5

- Ускорен якорный скролл меню.
- Убрана тяжёлая/медленная анимация кнопок меню.
- В карточках кейсов оставлен один срок размещения на карточку.
- Оба результата в кейсах указаны в процентах.
- Плашки результатов сделаны зелёными.
- Разделительная полоса после результатов убрана.
