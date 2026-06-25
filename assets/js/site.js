/* ===== МОБИЛЬНОЕ МЕНЮ ===== */
(function () {
  function initMenu() {
    var menu = document.querySelector("[data-eld-menu]");
    if (!menu) return;

    var burger = menu.querySelector("[data-mobile-menu-open]");
    var backdrop = menu.querySelector(".eld-mobile-menu-backdrop");
    var panel = menu.querySelector("[data-mobile-menu-panel]");
    var closeButtons = menu.querySelectorAll("[data-mobile-menu-close]");
    var links = menu.querySelectorAll("[data-mobile-menu-link]");

    function openMenu() {
      if (backdrop) backdrop.hidden = false;
      if (panel) panel.hidden = false;

      requestAnimationFrame(function () {
        menu.classList.add("is-open");
        document.body.classList.add("eld-menu-lock");
      });

      if (burger) burger.setAttribute("aria-expanded", "true");
      if (panel) panel.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
      menu.classList.remove("is-open");
      document.body.classList.remove("eld-menu-lock");

      if (burger) burger.setAttribute("aria-expanded", "false");
      if (panel) panel.setAttribute("aria-hidden", "true");

      window.setTimeout(function () {
        if (!menu.classList.contains("is-open")) {
          if (backdrop) backdrop.hidden = true;
          if (panel) panel.hidden = true;
        }
      }, 150);
    }

    function scrollToTarget(selector) {
      if (typeof window.eldSmoothScrollToBlock === "function") {
        window.eldSmoothScrollToBlock(null, selector);
        return;
      }

      var target = document.querySelector(selector);
      if (!target) return;

      var menuHeight = menu ? Math.ceil(menu.getBoundingClientRect().height) + 18 : 18;
      var targetY = target.getBoundingClientRect().top + window.pageYOffset - menuHeight;
      window.scrollTo(0, Math.max(0, targetY));
    }

    if (panel) {
      panel.addEventListener("click", function (event) {
        event.stopPropagation();
      });
      panel.addEventListener("touchstart", function (event) {
        event.stopPropagation();
      }, { passive: true });
    }

    if (burger) {
      burger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        if (menu.classList.contains("is-open")) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    if (backdrop) {
      backdrop.addEventListener("click", function (event) {
        event.preventDefault();
        closeMenu();
      });
    }

    closeButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      });
    });

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var href = link.getAttribute("href");

        if (href && href.charAt(0) === "#") {
          event.preventDefault();
          event.stopPropagation();

          closeMenu();

          window.setTimeout(function () {
            scrollToTarget(href);
          }, 30);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 640) {
        closeMenu();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMenu);
  } else {
    initMenu();
  }
})();

/* ===== ОТПРАВКА КАСТОМНЫХ ФОРМ В СКРЫТУЮ ФОРМУ TILDA ===== */
(function () {
  var hiddenFormRecId = "rec2417121671";

  function getHiddenTildaForm() {
    var rec = document.getElementById(hiddenFormRecId);
    if (!rec) return null;
    return rec.querySelector("form");
  }

  function getField(form, name) {
    if (!form || !name) return null;

    var fields = form.querySelectorAll("input, textarea, select");
    for (var i = 0; i < fields.length; i += 1) {
      if (fields[i].name === name) return fields[i];
    }

    return null;
  }

  function ensureHiddenField(form, name) {
    var field = getField(form, name);

    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }

    return field;
  }

  function setFieldValue(form, name, value) {
    var field = ensureHiddenField(form, name);
    if (!field) return;

    if (field.type === "checkbox" || field.type === "radio") {
      field.checked = !!value && value !== "Нет" && value !== "false";
      field.value = String(value || "");
    } else {
      field.value = String(value || "");
    }

    try {
      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    } catch (e) {}
  }

  function submitTildaForm(form) {
    var submitButton = form.querySelector('button[type="submit"], input[type="submit"], .t-submit');

    if (submitButton) {
      submitButton.click();
      return;
    }

    try {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    } catch (e) {
      if (typeof form.submit === "function") form.submit();
    }
  }

  window.eldSubmitToTildaHiddenForm = function (payload) {
    var form = getHiddenTildaForm();

    if (!form) {
      console.warn("[mediamesto] Скрытая Tilda-форма #" + hiddenFormRecId + " не найдена");
      return false;
    }

    var data = payload || {};

    setFieldValue(form, "name", data.name || "");
    setFieldValue(form, "phone", data.phone || "");
    setFieldValue(form, "comment", data.comment || "");
    setFieldValue(form, "disk_link", data.disk_link || "");
    setFieldValue(form, "form_type", data.form_type || "");
    setFieldValue(form, "summary", data.summary || "");
    setFieldValue(form, "page_url", data.page_url || window.location.href);
    setFieldValue(form, "policy_accept", data.policy_accept || "Да");

    submitTildaForm(form);
    return true;
  };
})();


/* ===== НОВЫЙ ВЕРХНИЙ БЛОК / ЛПР + ФОРМА ===== */
(function () {
  var root = document.querySelector(".eld-lpr-section");
  if (!root) return;

  function setActiveRadio(group) {
    if (!group) return;
    var labels = group.querySelectorAll("label");
    labels.forEach(function (label) {
      var input = label.querySelector('input[type="radio"]');
      label.classList.toggle("is-active", !!input && input.checked);
    });
  }

  function validateName(value) {
    var clean = String(value || "").trim();
    if (!clean) return "Введите имя";
    if (clean.length < 2) return "Имя слишком короткое";
    if (!/^[A-Za-zА-Яа-яЁёІіЇїЄє\s-]+$/.test(clean)) return "Введите корректное имя";
    return "";
  }

  function validatePhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "Введите номер телефона";
    if (digits.length < 10) return "Номер слишком короткий";
    if (digits.length > 11) return "Введите корректный номер";
    return "";
  }

  function setFieldError(input, errorEl, message) {
    if (!input || !errorEl) return;
    if (message) {
      input.classList.add("is-error");
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-error");
      errorEl.textContent = "";
    }
  }

  root.querySelectorAll("[data-lpr-duration], [data-lpr-period]").forEach(function (group) {
    setActiveRadio(group);

    group.addEventListener("change", function () {
      setActiveRadio(group);
      updateSummary();
    });

    group.querySelectorAll("label").forEach(function (label) {
      label.addEventListener("click", function () {
        setTimeout(function () {
          setActiveRadio(group);
          updateSummary();
        }, 0);
      });
    });
  });

  function updateSummary() {
    var form = root.querySelector("[data-lpr-form]");
    if (!form) return;

    var commentInput = form.querySelector("[data-lpr-comment]");
    var summary = form.querySelector("[data-lpr-summary]");
    var comment = commentInput ? String(commentInput.value || "").trim() : "";

    if (summary) {
      summary.value = "Заявка на консультацию" + (comment ? " / Комментарий: " + comment : "");
    }
  }

  var form = root.querySelector("[data-lpr-form]");
  if (!form) return;

  var nameInput = form.querySelector("[data-lpr-name]");
  var phoneInput = form.querySelector("[data-lpr-phone]");
  var policyInput = form.querySelector("[data-lpr-policy]");
  var commentInput = form.querySelector("[data-lpr-comment]");
  var nameError = form.querySelector("[data-lpr-name-error]");
  var phoneError = form.querySelector("[data-lpr-phone-error]");
  var policyError = form.querySelector("[data-lpr-policy-error]");

  if (nameInput) {
    nameInput.addEventListener("input", function () {
      setFieldError(nameInput, nameError, validateName(nameInput.value));
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      var value = phoneInput.value.replace(/[^\d+]/g, "");
      if (value.indexOf("+") > 0) value = value.replace(/\+/g, "");
      phoneInput.value = value;
      setFieldError(phoneInput, phoneError, validatePhone(phoneInput.value));
    });
  }

  if (commentInput) {
    commentInput.addEventListener("input", updateSummary);
  }

  if (policyInput) {
    policyInput.addEventListener("change", function () {
      if (policyError) policyError.textContent = policyInput.checked ? "" : "Примите политику обработки персональных данных";
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    updateSummary();

    var nameMessage = validateName(nameInput ? nameInput.value : "");
    var phoneMessage = validatePhone(phoneInput ? phoneInput.value : "");
    var policyMessage = policyInput && policyInput.checked ? "" : "Примите политику обработки персональных данных";

    setFieldError(nameInput, nameError, nameMessage);
    setFieldError(phoneInput, phoneError, phoneMessage);
    if (policyError) policyError.textContent = policyMessage;

    if (nameMessage || phoneMessage || policyMessage) return;

    var commentText = commentInput ? String(commentInput.value || "").trim() : "";
    var summaryInput = form.querySelector("[data-lpr-summary]");
    var summaryText = summaryInput && summaryInput.value ? summaryInput.value : "Заявка на консультацию";

    var submitted = true;
    if (typeof window.eldSubmitToTildaHiddenForm === "function") {
      submitted = window.eldSubmitToTildaHiddenForm({
        form_type: "Получить консультацию",
        name: nameInput ? String(nameInput.value || "").trim() : "",
        phone: phoneInput ? String(phoneInput.value || "").trim() : "",
        comment: commentText,
        disk_link: "",
        summary: summaryText,
        page_url: window.location.href,
        policy_accept: policyInput && policyInput.checked ? "Да" : "Нет"
      });
    }

    var button = form.querySelector('button[type="submit"]');
    if (button) {
      button.textContent = submitted ? "Заявка отправлена" : "Форма не найдена";
      button.disabled = submitted;
    }
  });

  updateSummary();
})();


/* ОБЪЕДИНЕННЫЕ СКРИПТЫ ЛЕНДИНГА / TILDA JS */
/* Вставлять в JS. Без тегов . */

/* ===== БЛОК 1 ===== */
(function() {
  var root = document.getElementById('traffic-ads-hero-orange-safari');
  if (!root) return;

  var nums = root.querySelectorAll('.tahos-num');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasAnimated = false;

  function formatNumber(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function animateValue(el) {
    var target = parseInt(el.getAttribute('data-target'), 10) || 0;
    if (reducedMotion) {
      el.textContent = formatNumber(target);
      return;
    }

    var duration = 1800;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(target * eased);
      el.textContent = formatNumber(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target);
      }
    }

    requestAnimationFrame(step);
  }

  function startCounters() {
    if (hasAnimated) return;
    hasAnimated = true;
    nums.forEach(animateValue);
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          startCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });
    observer.observe(root);
  } else {
    startCounters();
  }

  var video = root.querySelector('.tahos-video');

  if (video) {
    var playAttempts = 0;

    function prepareVideo() {
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = false;

      video.setAttribute('muted', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('loop', '');
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('preload', 'metadata');
      video.removeAttribute('controls');
    }

    function playVideo() {
      prepareVideo();
      playAttempts += 1;

      try {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function() {});
        }
      } catch (e) {}
    }

    function reloadAndPlay() {
      prepareVideo();

      try {
        video.load();
      } catch (e) {}

      setTimeout(playVideo, 80);
    }

    video.addEventListener('loadedmetadata', playVideo);
    video.addEventListener('loadeddata', playVideo);
    video.addEventListener('canplay', playVideo);
    video.addEventListener('canplaythrough', playVideo);

    video.addEventListener('pause', function() {
      if (!document.hidden && playAttempts < 20) {
        setTimeout(playVideo, 150);
      }
    });

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) playVideo();
    });

    document.addEventListener('touchstart', playVideo, { passive: true });
    document.addEventListener('pointerdown', playVideo, { passive: true });
    document.addEventListener('click', playVideo);
    document.addEventListener('scroll', playVideo, { passive: true });

    reloadAndPlay();
    setTimeout(playVideo, 100);
    setTimeout(playVideo, 600);
    setTimeout(playVideo, 1500);
    setTimeout(playVideo, 3000);
  }
  var mobileVideo = root.querySelector('.tahos-mobile-video');

  if (mobileVideo) {
    function playMobileVideo() {
      mobileVideo.muted = true;
      mobileVideo.defaultMuted = true;
      mobileVideo.autoplay = true;
      mobileVideo.loop = true;
      mobileVideo.playsInline = true;
      mobileVideo.controls = false;

      mobileVideo.setAttribute('muted', '');
      mobileVideo.setAttribute('autoplay', '');
      mobileVideo.setAttribute('loop', '');
      mobileVideo.setAttribute('playsinline', '');
      mobileVideo.setAttribute('webkit-playsinline', '');
      mobileVideo.setAttribute('preload', 'auto');
      mobileVideo.removeAttribute('controls');

      try {
        var promise = mobileVideo.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function() {});
        }
      } catch (e) {}
    }

    mobileVideo.addEventListener('loadedmetadata', playMobileVideo);
    mobileVideo.addEventListener('loadeddata', playMobileVideo);
    mobileVideo.addEventListener('canplay', playMobileVideo);
    mobileVideo.addEventListener('canplaythrough', playMobileVideo);

    document.addEventListener('touchstart', playMobileVideo, { passive: true });
    document.addEventListener('pointerdown', playMobileVideo, { passive: true });
    document.addEventListener('click', playMobileVideo);
    document.addEventListener('scroll', playMobileVideo, { passive: true });

    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) playMobileVideo();
    });

    setTimeout(playMobileVideo, 100);
    setTimeout(playMobileVideo, 600);
    setTimeout(playMobileVideo, 1500);
  }

})();

/* ===== БЛОК 4 ===== */
(function () {
    var pointsData = [
      {
        title: "Разметелево",
        address: "Луговая улица",
        tags: ["Стенд на въезде", "Большая проходимость", "500+ участков (200 застроено)"],
        size: "Размер экрана: 640 × 1280 см",
        text: [
          "Коттеджный посёлок с активной застройкой. Все дороги проходят через один въезд, где установлена рекламная конструкция.",
          "В посёлке запроектированы апартаменты, торговый центр, медицинский центр, спортивный центр, школа и детский сад."
        ],
        image: "",
        coords: [59.915996, 30.724942]
      },
      {
        title: "Дружное",
        address: "СНТ коттеджный посёлок Дружное",
        tags: ["Стенд на въезде", "Большая проходимость", "290+ участков (150 застроено)"],
        size: "Размер экрана: 640 × 1600 см",
        text: [
          "Рекламная установка расположена на единственном въезде в СНТ.",
          "Точка стоит справа от шлагбаума, поэтому конструкция попадает в поле зрения входящего и выезжающего трафика."
        ],
        image: "",
        coords: [59.887441, 30.779491]
      },
      {
        title: "Энергетиков 8к1",
        address: "проспект Энергетиков, 8к1",
        tags: ["В торговом центре", "Видят более 20 000 человек"],
        size: "Размер экрана: 640 × 1280 см",
        text: [
          "Точка рядом с торговым центром и жилыми комплексами с высоким трафиком.",
          "В пешей доступности три больших ЖК. В ТЦ находятся фитнес-клуб, пекарни, супермаркет, секции и другие повседневные точки притяжения."
        ],
        image: "",
        coords: [59.937813, 30.434820]
      },
      {
        title: "СНТ Северная жемчужина",
        id: "severnaya",
        coords: [60.152531, 30.093076],
        soon: true
      },
      {
        title: "СНТ Вартемяги",
        id: "vartemyagi",
        coords: [60.1789, 30.3482],
        soon: true
      },
      {
        title: "СНТ Любовино",
        id: "lyubovino",
        coords: [60.181867, 30.343231],
        soon: true
      }
    ];

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function loadYandexMaps(callback) {
      if (window.ymaps) {
        callback();
        return;
      }

      var existing = document.querySelector("script[data-eld-ymaps-loader]");
      if (existing) {
        existing.addEventListener("load", callback);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
      script.async = true;
      script.setAttribute("data-eld-ymaps-loader", "true");
      script.onload = callback;
      document.head.appendChild(script);
    }

    function pointHtml(point, index) {
      if (point.soon) {
        return (
          '<div class="eld-map-point eld-map-point--soon eld-map-point--soon-' + escapeHtml(point.id) + '" data-eld-point="' + index + '">' +
            '<div class="eld-map-point-card">' +
              '<span class="eld-map-point-soon-line">Скоро</span>' +
              '<span class="eld-map-point-soon-line">открытие</span>' +
            '</div>' +
          '</div>'
        );
      }

      return (
        '<div class="eld-map-point" data-eld-point="' + index + '">' +
          '<button class="eld-map-point-card" type="button" data-eld-point-button="' + index + '">' +
            '<h3>' + escapeHtml(point.title) + '</h3>' +
            '<div class="eld-map-point-address">' + escapeHtml(point.address) + '</div>' +
          '</button>' +
        '</div>'
      );
    }

    function panelHtml(point) {
      var tags = point.tags.map(function (tag) {
        return "<span>" + escapeHtml(tag) + "</span>";
      }).join("");

      var paragraphs = point.text.map(function (text) {
        return "<p>" + escapeHtml(text) + "</p>";
      }).join("");

      var imageStyle = point.image ? ' style="background-image:url(' + escapeHtml(point.image) + '); background-size:cover; background-position:center;"' : "";

      return (
        '<div class="eld-map-panel-image"' + imageStyle + '>' +
          '<div class="eld-map-panel-screen-tag">' + escapeHtml(point.size) + '</div>' +
          '<div class="eld-map-panel-image-tags">' + tags + '</div>' +
        '</div>' +
        '<h3>' + escapeHtml(point.title) + '</h3>' +
        '<div class="eld-map-panel-address">' + escapeHtml(point.address) + '</div>' +
        '<div class="eld-map-panel-text">' + paragraphs + '</div>'
      );
    }

    function initBlock(root) {
      var mapNode = root.querySelector("[data-eld-map-canvas]");
      var panel = root.querySelector("[data-eld-panel]");
      var panelInner = root.querySelector("[data-eld-panel-inner]");
      var panelClose = root.querySelector("[data-eld-panel-close]");
      var edgeDotsNode = root.querySelector("[data-eld-edge-dots]");
      if (!mapNode || !window.ymaps) return;

      var activeIndex = null;
      var placemarks = [];
      var edgeDots = {};

      var map = new ymaps.Map(mapNode, {
        center: [59.89, 30.58],
        zoom: 10,
        controls: ["zoomControl", "typeSelector"]
      }, {
        suppressMapOpenBlock: true,
        yandexMapDisablePoiInteractivity: true
      });

      function getPointPixel(coords) {
        var zoom = map.getZoom();
        var projection = map.options.get("projection");
        var globalPixel = projection.toGlobalPixels(coords, zoom);
        var pagePixel = map.converter.globalToPage(globalPixel);
        var rect = mapNode.getBoundingClientRect();

        return {
          x: pagePixel[0] - rect.left,
          y: pagePixel[1] - rect.top
        };
      }

      function createEdgeDot(index) {
        if (!edgeDotsNode) return;

        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "eld-map-edge-dot";
        dot.setAttribute("data-eld-edge-dot", String(index));
        dot.setAttribute("aria-label", pointsData[index].title);

        dot.addEventListener("click", function (event) {
          event.preventDefault();
          event.stopPropagation();

          var point = pointsData[index];
          if (!point) return;

          map.panTo(point.coords, {
            flying: true,
            duration: 700
          }).then(function () {
            if (!point.soon) {
              openPanel(index);
            }
            updateEdgeDots();
            refreshCards();
          });
        });

        edgeDotsNode.appendChild(dot);
        edgeDots[index] = dot;
      }

      function updateEdgeDots() {
        if (!edgeDotsNode) return;

        var bounds = map.getBounds();
        if (!bounds) return;

        var south = bounds[0][0];
        var west = bounds[0][1];
        var north = bounds[1][0];
        var east = bounds[1][1];

        var rect = mapNode.getBoundingClientRect();
        var panelRect = panel && panel.classList.contains("is-open") ? panel.getBoundingClientRect() : null;
        var panelLeft = panelRect && window.innerWidth > 640 ? panelRect.left - rect.left : rect.width;
        var availableRight = Math.max(14, panelLeft - 14);
        var margin = 14;
        var used = {
          top: [],
          right: [],
          bottom: [],
          left: []
        };

        Object.keys(edgeDots).forEach(function (key) {
          var index = Number(key);
          var dot = edgeDots[index];
          var point = pointsData[index];

          if (!dot || !point) return;

          var lat = point.coords[0];
          var lon = point.coords[1];

          var isVisibleOnMap = (
            lat >= south &&
            lat <= north &&
            lon >= west &&
            lon <= east
          );

          var pixel = getPointPixel(point.coords);
          var isBehindOpenPanel = (
            panelRect &&
            window.innerWidth > 640 &&
            isVisibleOnMap &&
            pixel.x > availableRight
          );

          if (isVisibleOnMap && !isBehindOpenPanel) {
            dot.classList.remove("is-visible");
            return;
          }

          var side = "top";

          if (lat > north) {
            side = "top";
          } else if (lat < south) {
            side = "bottom";
          } else if (lon < west) {
            side = "left";
          } else if (lon > east) {
            side = "right";
          }

          var x = Math.min(Math.max(pixel.x, margin), availableRight);
          var y = Math.min(Math.max(pixel.y, margin), rect.height - margin);

          if (side === "top") {
            y = margin;
          } else if (side === "bottom") {
            y = rect.height - margin;
          } else if (side === "left") {
            x = margin;
          } else if (side === "right") {
            x = availableRight;
          }

          used[side].forEach(function (value) {
            if (side === "top" || side === "bottom") {
              if (Math.abs(value - x) < 22) {
                x = Math.min(availableRight, x + 22);
              }
            } else {
              if (Math.abs(value - y) < 22) {
                y = Math.min(rect.height - margin, y + 22);
              }
            }
          });

          if (side === "top" || side === "bottom") {
            used[side].push(x);
          } else {
            used[side].push(y);
          }

          dot.style.transform = "translate3d(" + x + "px, " + y + "px, 0) translate(-50%, -50%)";
          dot.classList.add("is-visible");
        });
      }

      var CardLayout = ymaps.templateLayoutFactory.createClass(
        '$[properties.pointHtml]',
        {
          build: function () {
            CardLayout.superclass.build.call(this);

            var el = this.getParentElement().querySelector("[data-eld-point]");
            if (!el) return;

            var index = Number(el.getAttribute("data-eld-point"));
            var button = el.querySelector("[data-eld-point-button]");

            el.classList.toggle("is-active", activeIndex === index);

            if (button && !pointsData[index].soon) {
              button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                if (root.classList.contains("is-collapsed")) {
                  map.setZoom(10, { duration: 280 });
                }

                openPanel(index);
              });
            }
          }
        }
      );

      function refreshCards() {
        updateEdgeDots();

        placemarks.forEach(function (placemark, index) {
          var isSoon = !!pointsData[index].soon;
          var isActive = activeIndex === index && !isSoon;
          placemark.options.set("zIndex", isActive ? 10000 : (isSoon ? 70 : 100));
          placemark.options.set("zIndexHover", isActive ? 10000 : (isSoon ? 70 : 200));
          placemark.options.set("visible", false);
          setTimeout(function () {
            placemark.options.set("visible", true);
          }, 0);
        });
      }

      function openPanel(index) {
        activeIndex = index;

        if (panel && panelInner) {
          panelInner.innerHTML = panelHtml(pointsData[index]);
          panel.classList.add("is-open");
          panel.setAttribute("aria-hidden", "false");
        }

        refreshCards();
      }

      function closePanel() {
        activeIndex = null;

        if (panel) {
          panel.classList.remove("is-open");
          panel.setAttribute("aria-hidden", "true");
        }

        refreshCards();
      }

      var openPointsBounds = [];

      pointsData.forEach(function (point, index) {
        if (!point.soon) openPointsBounds.push(point.coords);

        var placemark = new ymaps.Placemark(point.coords, {
          pointHtml: pointHtml(point, index),
          hintContent: point.title
        }, {
          iconLayout: CardLayout,
          iconShape: {
            type: "Rectangle",
            coordinates: point.soon ? [[-85, -105], [85, 20]] : [[-150, -170], [150, 20]]
          },
          pane: "overlaps",
          zIndex: 100,
          zIndexHover: 200
        });

        placemarks.push(placemark);
        map.geoObjects.add(placemark);

        createEdgeDot(index);
      });

      function updateState() {
        var collapsed = map.getZoom() <= 9;
        root.classList.toggle("is-collapsed", collapsed);
      }

      if (panelClose) {
        panelClose.addEventListener("click", closePanel);
      }

      map.events.add(["boundschange", "actionend"], function () {
        updateState();
        refreshCards();
      });

      window.addEventListener("resize", function () {
        updateEdgeDots();
      });

      updateState();

      setTimeout(function () {
        map.setBounds(ymaps.util.bounds.fromPoints(openPointsBounds), {
          checkZoomRange: true,
          zoomMargin: [180, 560, 180, 180],
          duration: 0
        }).then(function () {
          if (map.getZoom() < 10) {
            map.setZoom(10, { duration: 0 });
          }
          updateState();

          if (window.innerWidth > 640) {
            openPanel(1);
          } else {
            closePanel();
            map.setCenter(pointsData[1].coords, 11, {
              duration: 0
            });
          }

          updateEdgeDots();
        });
      }, 300);
    }

    loadYandexMaps(function () {
      ymaps.ready(function () {
        document.querySelectorAll("[data-eld-map]").forEach(initBlock);
      });
    });
  })();

/* ===== БЛОК 5 / НОВЫЕ ТАРИФЫ ===== */
(function () {
  const root = document.querySelector(".eld-tcalc-section");
  if (!root) return;

  const tariffPrices = {
    "5": {
      "1": { newPrice: 13900, oldPrice: null, label: "1 месяц", totalMonths: 1 },
      "3": { newPrice: 29900, oldPrice: 41700, label: "3 месяца", totalMonths: 3 },
      "6": { newPrice: 59900, oldPrice: 83400, label: "6 месяцев (+1 м в подарок)", totalMonths: 7 },
      "12": { newPrice: 99900, oldPrice: 166800, label: "12 месяцев (+3 м в подарок)", totalMonths: 15 }
    },
    "10": {
      "1": { newPrice: 22900, oldPrice: 26900, label: "1 месяц", totalMonths: 1 },
      "3": { newPrice: 50900, oldPrice: 59900, label: "3 месяца", totalMonths: 3 },
      "6": { newPrice: 101900, oldPrice: 119900, label: "6 месяцев (+1 м в подарок)", totalMonths: 7 },
      "12": { newPrice: 169900, oldPrice: 199900, label: "12 месяцев (+3 м в подарок)", totalMonths: 15 }
    },
    "15": {
      "1": { newPrice: 29900, oldPrice: 39900, label: "1 месяц", totalMonths: 1 },
      "3": { newPrice: 67400, oldPrice: 89900, label: "3 месяца", totalMonths: 3 },
      "6": { newPrice: 134900, oldPrice: 179900, label: "6 месяцев (+1 м в подарок)", totalMonths: 7 },
      "12": { newPrice: 224900, oldPrice: 299900, label: "12 месяцев (+3 м в подарок)", totalMonths: 15 }
    }
  };

  const formatPrice = (value) => {
    return Math.round(value).toLocaleString("ru-RU") + " ₽";
  };

  const getAirHours = (duration, totalMonths) => {
    const baseHoursByDuration = {
      "5": 30,
      "10": 60,
      "15": 90
    };

    return (baseHoursByDuration[String(duration)] || 0) * (totalMonths || 1);
  };

  const formatHours = (hours) => {
    return hours.toLocaleString("ru-RU") + " часов эфира";
  };

  const animateNumber = (el, to) => {
    const duration = 420;
    const fromText = (el.textContent || "").replace(/\D/g, "");
    const from = fromText ? Number(fromText) : 0;
    const start = performance.now();

    el.classList.add("is-changing");

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = from + (to - from) * eased;

      el.textContent = formatPrice(current);

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatPrice(to);
        setTimeout(() => el.classList.remove("is-changing"), 120);
      }
    };

    requestAnimationFrame(frame);
  };

  const getPlacesText = (count) => {
    if (count === 1) return "Выбрано 1 место";
    if (count === 2) return "Выбрано 2 места";
    return "Выбрано " + count + " места";
  };

  const validateName = (value) => {
    const clean = value.trim();
    if (!clean) return "Введите имя";
    if (clean.length < 2) return "Имя слишком короткое";
    if (!/^[A-Za-zА-Яа-яЁёІіЇїЄє\s-]+$/.test(clean)) return "Введите корректное имя";
    return "";
  };

  const validatePhone = (value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "Введите номер телефона";
    if (digits.length < 10) return "Номер слишком короткий";
    if (digits.length > 11) return "Введите корректный номер";
    return "";
  };

  const setFieldError = (input, errorEl, message) => {
    if (!input || !errorEl) return;
    if (message) {
      input.classList.add("is-error");
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-error");
      errorEl.textContent = "";
    }
  };

  const getCardSummary = (card, finalTotal, priceData, placesCount) => {
    const tariff = card.dataset.tariff || "";
    const places = Array.from(card.querySelectorAll("[data-places] input:checked"))
      .map((input) => input.closest("label").querySelector("span").textContent.trim())
      .join(", ");

    return tariff + " / " + priceData.label + " / " + placesCount + " мест(а) / " + places + " / " + formatPrice(finalTotal);
  };

  const escapeTagText = (value) => {
    return String(value || "").replace(/[&<>'"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
      }[char];
    });
  };

  const renderSelectedTags = (card, priceData) => {
    const periodBox = card.querySelector("[data-selected-period]");
    const placesBox = card.querySelector("[data-selected-places]");

    const places = Array.from(card.querySelectorAll("[data-places] input:checked"))
      .map((input) => input.closest("label").querySelector("span").textContent.trim());

    if (periodBox) {
      periodBox.innerHTML = "<span>" + escapeTagText(priceData.label) + "</span>";
    }

    if (placesBox) {
      placesBox.innerHTML = places
        .map((place) => "<span>" + escapeTagText(place) + "</span>")
        .join("");
    }
  };

  const updateCard = (card) => {
    const duration = card.dataset.duration || "5";
    const activePeriod = card.querySelector("[data-months] button.is-active");
    const period = activePeriod ? activePeriod.dataset.period : "1";
    const priceData = tariffPrices[duration][period];

    const checkedPlaces = card.querySelectorAll("[data-places] input:checked").length;
    const placesCount = Math.max(checkedPlaces, 1);
    const placeDiscount = placesCount >= 2 ? 10 : 0;

    const baseTotal = priceData.newPrice * placesCount;
    const finalTotal = placeDiscount ? baseTotal * 0.9 : baseTotal;
    const oldTotal = priceData.oldPrice ? priceData.oldPrice * placesCount : null;

    const priceEl = card.querySelector("[data-price]");
    const oldEl = card.querySelector("[data-old]");
    const economyEl = card.querySelector("[data-economy]");
    const airTimeEl = card.querySelector("[data-air-time]");
    const placeNote = card.querySelector("[data-place-note]");
    const formTariff = card.querySelector("[data-form-tariff]");
    const formSummary = card.querySelector("[data-form-summary]");

    animateNumber(priceEl, finalTotal);

    if (airTimeEl) {
      airTimeEl.textContent = formatHours(getAirHours(duration, priceData.totalMonths));
    }

    if (oldEl) {
      oldEl.textContent = oldTotal ? formatPrice(oldTotal) : "";
    }

    if (economyEl) {
      if (placeDiscount) {
        economyEl.textContent = "доп. скидка -10%";
        economyEl.classList.add("is-visible");
      } else {
        economyEl.textContent = "";
        economyEl.classList.remove("is-visible");
      }
    }

    if (placeNote) {
      placeNote.textContent = getPlacesText(placesCount) + (placeDiscount ? " · доп. скидка 10%" : "");
    }

    if (formTariff) formTariff.value = card.dataset.tariff || "";
    if (formSummary) formSummary.value = getCardSummary(card, finalTotal, priceData, placesCount);
    renderSelectedTags(card, priceData);
  };

  root.querySelectorAll(".eld-tcalc-card").forEach((card) => {
    card.querySelectorAll("[data-months] button").forEach((button) => {
      button.addEventListener("click", () => {
        card.querySelectorAll("[data-months] button").forEach((item) => {
          item.classList.remove("is-active");
        });

        button.classList.add("is-active");
        updateCard(card);
      });
    });

    card.querySelectorAll("[data-places] input").forEach((input) => {
      input.addEventListener("change", () => {
        const checked = card.querySelectorAll("[data-places] input:checked");

        if (checked.length === 0) {
          input.checked = true;
        }

        updateCard(card);
      });
    });

    const openButton = card.querySelector("[data-open-form]");
    if (openButton) {
      openButton.addEventListener("click", () => {
        updateCard(card);
        card.style.minHeight = card.offsetHeight + "px";
        card.classList.add("is-form-open");

        setTimeout(() => {
          const top = card.getBoundingClientRect().top + window.pageYOffset - 110;
          window.scrollTo({
            top: Math.max(0, top),
            behavior: "smooth"
          });
        }, 40);
      });
    }

    const backButton = card.querySelector("[data-back-step]");
    if (backButton) {
      backButton.addEventListener("click", () => {
        card.classList.remove("is-form-open");
        card.style.minHeight = "";
      });
    }

    const form = card.querySelector("[data-form]");
    if (form) {
      const nameInput = form.querySelector("[data-name-input]");
      const phoneInput = form.querySelector("[data-phone-input]");
      const policyInput = form.querySelector("[data-tcalc-policy]");
      const nameError = form.querySelector("[data-name-error]");
      const phoneError = form.querySelector("[data-phone-error]");
      const policyError = form.querySelector("[data-tcalc-policy-error]");

      if (nameInput) {
        nameInput.addEventListener("input", () => {
          setFieldError(nameInput, nameError, validateName(nameInput.value));
        });
      }

      if (phoneInput) {
        phoneInput.addEventListener("input", () => {
          let value = phoneInput.value.replace(/[^\d+]/g, "");
          if (value.indexOf("+") > 0) value = value.replace(/\+/g, "");
          phoneInput.value = value;
          setFieldError(phoneInput, phoneError, validatePhone(phoneInput.value));
        });
      }

      if (policyInput) {
        policyInput.addEventListener("change", () => {
          if (policyError) {
            policyError.textContent = policyInput.checked ? "" : "Примите политику обработки персональных данных";
          }
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nameMessage = validateName(nameInput ? nameInput.value : "");
        const phoneMessage = validatePhone(phoneInput ? phoneInput.value : "");
        const policyMessage = policyInput && policyInput.checked ? "" : "Примите политику обработки персональных данных";

        setFieldError(nameInput, nameError, nameMessage);
        setFieldError(phoneInput, phoneError, phoneMessage);
        if (policyError) policyError.textContent = policyMessage;

        if (nameMessage || phoneMessage || policyMessage) return;

        const button = form.querySelector('button[type="submit"]');
        if (button) {
          button.textContent = "Заявка отправлена";
          button.disabled = true;
        }
      });
    }

    updateCard(card);
  });
})();

/* ===== БЛОК 6 ===== */
(function () {
    const root = document.querySelector(".eld-rss-blog-section");
    if (!root) return;

    const feedUrl = root.dataset.feedUrl || "/rss/";
    const allUrl = root.dataset.allUrl || "/blog";
    const grid = root.querySelector("[data-rss-grid]");
    const state = root.querySelector("[data-rss-state]");
    const filters = Array.from(root.querySelectorAll("[data-filter]"));
    const allLinks = Array.from(root.querySelectorAll(".eld-rss-blog-all"));

    let posts = [];
    let activeFilter = "all";

    allLinks.forEach(function (link) {
      link.href = allUrl;
    });

    function showState(text) {
      if (!state) return;
      state.textContent = text;
      state.classList.add("is-visible");
    }

    function hideState() {
      if (!state) return;
      state.classList.remove("is-visible");
    }

    function cleanText(value) {
      const div = document.createElement("div");
      div.innerHTML = value || "";
      return (div.textContent || div.innerText || "").trim();
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function getFirstText(item, selectors) {
      for (let i = 0; i < selectors.length; i++) {
        const el = item.querySelector(selectors[i]);
        if (el && el.textContent.trim()) return el.textContent.trim();
      }
      return "";
    }

    function getAllCategories(item) {
      const categoryEls = Array.from(item.getElementsByTagName("category"));
      const cats = categoryEls
        .map(function (el) {
          return cleanText(el.textContent || el.getAttribute("term") || el.getAttribute("label") || "");
        })
        .filter(Boolean)
        .map(normalizeCategory);

      const unique = [];
      cats.forEach(function (cat) {
        if (unique.indexOf(cat) === -1) unique.push(cat);
      });

      return unique.length ? unique : ["Прочее"];
    }

    function getImage(item, description) {
      const urlAttrs = ["url", "src", "href"];

      const tagNames = [
        "media:content",
        "media:thumbnail",
        "enclosure",
        "image",
        "thumbnail"
      ];

      for (let i = 0; i < tagNames.length; i++) {
        const els = Array.from(item.getElementsByTagName(tagNames[i]));
        for (let j = 0; j < els.length; j++) {
          for (let k = 0; k < urlAttrs.length; k++) {
            const url = els[j].getAttribute(urlAttrs[k]);
            if (url && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url)) return url;
          }

          const textUrl = cleanText(els[j].textContent || "");
          if (textUrl && /^https?:\/\//i.test(textUrl) && /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(textUrl)) {
            return textUrl;
          }
        }
      }

      const rawParts = [
        description || "",
        item.innerHTML || "",
        new XMLSerializer().serializeToString(item)
      ];

      for (let i = 0; i < rawParts.length; i++) {
        const raw = String(rawParts[i] || "");

        const decoded = raw
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#34;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&amp;/g, "&");

        const imgAttrMatch = decoded.match(/<img[^>]+(?:src|data-original|data-lazy|data-src)=["']([^"']+)["']/i);
        if (imgAttrMatch && imgAttrMatch[1]) return imgAttrMatch[1];

        const tildaMatch = decoded.match(/https?:\/\/[^"'\s<>]+(?:tildacdn|tilda)[^"'\s<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"'\s<>]*)?/i);
        if (tildaMatch && tildaMatch[0]) return tildaMatch[0];

        const anyImageMatch = decoded.match(/https?:\/\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^"'\s<>]*)?/i);
        if (anyImageMatch && anyImageMatch[0]) return anyImageMatch[0];
      }

      return "";
    }

    function normalizeCategory(value) {
      const clean = cleanText(value)
        .replace(/\s+/g, " ")
        .replace(/&amp;/g, "&")
        .trim();

      const lower = clean.toLowerCase();

      if (lower === "кейсы" || lower.includes("кейс")) return "Кейсы";
      if (lower === "о рекламе" || lower.includes("реклам")) return "О рекламе";
      if (lower === "прочее" || lower.includes("проч")) return "Прочее";

      return clean || "Прочее";
    }

    function parseFeed(xmlText) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, "text/xml");
      const items = Array.from(doc.querySelectorAll("item, entry"));

      return items.map(function (item) {
        const title = getFirstText(item, ["title"]) || "Без названия";
        const link = getFirstText(item, ["link"]) || (item.querySelector("link") ? item.querySelector("link").getAttribute("href") : "#");
        const rawDescription = getFirstText(item, ["description", "summary", "content\\:encoded", "encoded"]);
        const description = cleanText(rawDescription).slice(0, 180);
        const categories = getAllCategories(item);
        const image = getImage(item, rawDescription);

        return {
          title: title,
          link: link || "#",
          description: description,
          category: categories[0],
          categories: categories,
          image: image
        };
      });
    }

    function render() {
      const filtered = posts.filter(function (post) {
        return activeFilter === "all" || (post.categories || [post.category]).indexOf(activeFilter) !== -1;
      }).slice(0, 4);

      if (!grid) return;

      if (!filtered.length) {
        grid.innerHTML = "";
        showState("В этой категории пока нет статей.");
        return;
      }

      hideState();

      grid.innerHTML = filtered.map(function (post) {
        const imageHtml = post.image
          ? '<img src="' + escapeHtml(post.image) + '" alt="' + escapeHtml(post.title) + '" loading="lazy">'
          : "";

        return ''
          + '<article class="eld-rss-blog-card">'
          + '  <div class="eld-rss-blog-image">'
          + imageHtml
          + '    <span class="eld-rss-blog-tag">' + escapeHtml(post.category) + '</span>'
          + '  </div>'
          + '  <div class="eld-rss-blog-body">'
          + '    <h3>' + escapeHtml(post.title) + '</h3>'
          + '    <p>' + escapeHtml(post.description) + '</p>'
          + '    <a href="' + escapeHtml(post.link) + '">Читать</a>'
          + '  </div>'
          + '</article>';
      }).join("");
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        activeFilter = button.dataset.filter || "all";

        filters.forEach(function (item) {
          item.classList.remove("is-active");
        });

        button.classList.add("is-active");
        render();
      });
    });

    showState("Загружаем статьи...");

    fetch(feedUrl, {
      cache: "no-store"
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Не удалось загрузить RSS");
        return response.text();
      })
      .then(function (xmlText) {
        posts = parseFeed(xmlText);
        console.log("[eld-rss-blog] Загружены статьи:", posts.map(function (post) {
          return {
            title: post.title,
            categories: post.categories,
            image: post.image
          };
        }));

        if (!posts.length) {
          showState("Статьи не найдены. Проверь RSS-ссылку в data-feed-url.");
          return;
        }

        render();
      })
      .catch(function () {
        showState("Не удалось загрузить статьи. Проверь ссылку RSS в data-feed-url.");
      });
  })();


/* ===== НОВЫЙ БЛОК ПОСЛЕ ЛОКАЦИЙ / ДИЗАЙН ПОД КЛЮЧ ===== */
(function () {
  var root = document.querySelector(".eld-design-launch-section");
  if (!root) return;

  var form = root.querySelector("[data-design-form]");
  if (!form) return;

  var nameInput = form.querySelector("[data-design-name]");
  var phoneInput = form.querySelector("[data-design-phone]");
  var linkInput = form.querySelector("[data-design-link]");
  var designPolicyInput = form.querySelector("[data-design-policy]");
  var designPolicyError = form.querySelector("[data-design-policy-error]");
  var nameError = form.querySelector("[data-design-name-error]");
  var phoneError = form.querySelector("[data-design-phone-error]");
  var linkError = form.querySelector("[data-design-link-error]");

  function validateName(value) {
    var clean = String(value || "").trim();
    if (!clean) return "Введите имя";
    if (clean.length < 2) return "Имя слишком короткое";
    if (!/^[A-Za-zА-Яа-яЁёІіЇїЄє\s-]+$/.test(clean)) return "Введите корректное имя";
    return "";
  }

  function validatePhone(value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "Введите номер телефона";
    if (digits.length < 10) return "Номер слишком короткий";
    if (digits.length > 11) return "Введите корректный номер";
    return "";
  }

  function validateLink(value) {
    var clean = String(value || "").trim();
    if (!clean) return "Добавьте ссылку на диск";
    if (!/^https?:\/\/.+/i.test(clean)) return "Ссылка должна начинаться с http или https";
    return "";
  }

  function setFieldError(input, errorEl, message) {
    if (!input || !errorEl) return;
    if (message) {
      input.classList.add("is-error");
      errorEl.textContent = message;
    } else {
      input.classList.remove("is-error");
      errorEl.textContent = "";
    }
  }

  if (nameInput) {
    nameInput.addEventListener("input", function () {
      setFieldError(nameInput, nameError, validateName(nameInput.value));
    });
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      var value = phoneInput.value.replace(/[^\d+]/g, "");
      if (value.indexOf("+") > 0) value = value.replace(/\+/g, "");
      phoneInput.value = value;
      setFieldError(phoneInput, phoneError, validatePhone(phoneInput.value));
    });
  }

  if (linkInput) {
    linkInput.addEventListener("input", function () {
      setFieldError(linkInput, linkError, validateLink(linkInput.value));
    });
  }

  if (designPolicyInput) {
    designPolicyInput.addEventListener("change", function () {
      if (designPolicyError) {
        designPolicyError.textContent = designPolicyInput.checked ? "" : "Примите политику обработки персональных данных";
      }
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var nameMessage = validateName(nameInput ? nameInput.value : "");
    var phoneMessage = validatePhone(phoneInput ? phoneInput.value : "");
    var linkMessage = validateLink(linkInput ? linkInput.value : "");
    var policyMessage = designPolicyInput && designPolicyInput.checked ? "" : "Примите политику обработки персональных данных";

    setFieldError(nameInput, nameError, nameMessage);
    setFieldError(phoneInput, phoneError, phoneMessage);
    setFieldError(linkInput, linkError, linkMessage);
    if (designPolicyError) designPolicyError.textContent = policyMessage;

    if (nameMessage || phoneMessage || linkMessage || policyMessage) return;

    var linkText = linkInput ? String(linkInput.value || "").trim() : "";
    var submitted = true;
    if (typeof window.eldSubmitToTildaHiddenForm === "function") {
      submitted = window.eldSubmitToTildaHiddenForm({
        form_type: "Получить дизайн",
        name: nameInput ? String(nameInput.value || "").trim() : "",
        phone: phoneInput ? String(phoneInput.value || "").trim() : "",
        comment: "",
        disk_link: linkText,
        summary: "Заявка на создание дизайна для загородной рекламы" + (linkText ? " / Ссылка на диск: " + linkText : ""),
        page_url: window.location.href,
        policy_accept: designPolicyInput && designPolicyInput.checked ? "Да" : "Нет"
      });
    }

    var button = form.querySelector('button[type="submit"]');
    if (button) {
      button.textContent = submitted ? "Заявка отправлена" : "Форма не найдена";
      button.disabled = submitted;
    }
  });
})();











/* ===== МЕНЮ: ПЛАВНЫЙ СКРОЛЛ И АКТИВНАЯ КНОПКА / ЧИСТАЯ ВЕРСИЯ ===== */
(function () {
  var animationFrameId = null;

  function getMenuOffset() {
    var menu = document.querySelector("[data-eld-menu]");
    return menu ? Math.ceil(menu.getBoundingClientRect().height) + 28 : 24;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function stopAnimation() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function animateScrollTo(targetY, duration) {
    stopAnimation();

    var startY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var maxY = Math.max(
      0,
      Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight
    );
    var endY = Math.max(0, Math.min(targetY, maxY));
    var distance = endY - startY;
    var startTime = null;

    if (Math.abs(distance) < 2) {
      setActiveByScroll();
      return;
    }

    function frame(timestamp) {
      if (!startTime) startTime = timestamp;

      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = easeOutCubic(progress);

      window.scrollTo(0, startY + distance * eased);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(frame);
      } else {
        window.scrollTo(0, endY);
        animationFrameId = null;
        setActiveByScroll();
      }
    }

    animationFrameId = requestAnimationFrame(frame);
  }

  window.eldSmoothScrollToBlock = function (event, selector) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    var target = document.querySelector(selector);
    if (!target) return false;

    var targetY = target.getBoundingClientRect().top + window.pageYOffset - getMenuOffset();
    animateScrollTo(targetY, 420);

    return false;
  };

  function getMenuItems() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-menu-link]"))
      .map(function (link) {
        var id = link.getAttribute("data-menu-target");
        var section = id ? document.getElementById(id) : null;
        return section ? { link: link, section: section, id: id } : null;
      })
      .filter(Boolean);
  }

  function clearActive(items) {
    items.forEach(function (item) {
      item.link.classList.remove("is-active");
      item.link.removeAttribute("aria-current");
    });
  }

  function setActiveByScroll() {
    var items = getMenuItems();
    if (!items.length) return;

    var menu = document.querySelector("[data-eld-menu]");
    var offset = menu ? menu.offsetHeight + 110 : 160;
    var line = window.pageYOffset + offset;
    var active = items[0];

    items.forEach(function (item) {
      if (item.section.offsetTop <= line) {
        active = item;
      }
    });

    clearActive(items);

    if (active && active.link) {
      active.link.classList.add("is-active");
      active.link.setAttribute("aria-current", "page");
    }
  }

  function initMenuActive() {
    var ticking = false;

    function requestActiveUpdate() {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(function () {
        ticking = false;
        setActiveByScroll();
      });
    }

    setActiveByScroll();
    window.addEventListener("scroll", requestActiveUpdate, { passive: true });
    window.addEventListener("resize", requestActiveUpdate);
    window.addEventListener("load", requestActiveUpdate);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMenuActive);
  } else {
    initMenuActive();
  }

  window.addEventListener("wheel", stopAnimation, { passive: true });
  window.addEventListener("touchstart", stopAnimation, { passive: true });
})();
