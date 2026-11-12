/* =====================================================================
   SAMKANELI · script.js
   Menú · revelado · carrusel · lightbox · pestañas · filtros
   contacto · copiar color · video · formulario · valores corporativos
   ===================================================================== */
   (function () {
    "use strict";

    var $ = function (s, c) {
        return (c || document).querySelector(s);
    };

    var $$ = function (s, c) {
        return Array.prototype.slice.call(
            (c || document).querySelectorAll(s)
        );
    };

    var reduce = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------- Menú ---------- */
    var toggle = $(".nav-toggle");
    var nav = $("#menu");

    function setNav(open) {
        if (!toggle || !nav) return;

        nav.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", open);
        toggle.setAttribute(
            "aria-label",
            open ? "Cerrar menú" : "Abrir menú"
        );
        document.body.classList.toggle("nav-open", open);
    }

    if (toggle) {
        toggle.addEventListener("click", function () {
            setNav(!nav.classList.contains("open"));
        });

        $$("#menu a").forEach(function (a) {
            a.addEventListener("click", function () {
                setNav(false);
            });
        });
    }

    function closeSubs(except) {
        $$(".has-sub").forEach(function (li) {
            if (li !== except) {
                li.classList.remove("open");
                var b = $(".sub-btn", li);
                if (b) b.setAttribute("aria-expanded", "false");
            }
        });
    }

    $$(".sub-btn").forEach(function (b) {
        b.addEventListener("click", function (e) {
            e.stopPropagation();

            var li = b.parentNode;
            var open = !li.classList.contains("open");

            closeSubs(li);
            li.classList.toggle("open", open);
            b.setAttribute("aria-expanded", open);
        });
    });

    document.addEventListener("click", function (e) {
        if (!e.target.closest(".has-sub")) closeSubs();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            var lbOpen = $(".lb.open");
            if (lbOpen) return;

            if (nav && nav.classList.contains("open")) {
                setNav(false);
                if (toggle) toggle.focus();
            }

            closeSubs();
        }
    });

    if (window.matchMedia) {
        var mediaDesktop = window.matchMedia("(min-width:1181px)");

        if (mediaDesktop.addEventListener) {
            mediaDesktop.addEventListener("change", function () {
                setNav(false);
            });
        } else if (mediaDesktop.addListener) {
            mediaDesktop.addListener(function () {
                setNav(false);
            });
        }
    }

    /* ---------- Revelado al desplazarse ---------- */
    var rv = $$(".reveal");

    if ("IntersectionObserver" in window && !reduce) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in");
                    io.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -5% 0px"
        });

        rv.forEach(function (el) {
            io.observe(el);
        });
    } else {
        rv.forEach(function (el) {
            el.classList.add("in");
        });
    }

    /* ---------- Carrusel ---------- */
    $$("[data-carousel]").forEach(function (c) {
        var track = $(".car-track", c);
        var slides = $$(".car-slide", c);

        if (!track || !slides.length) return;

        var n = slides.length;
        var idx = 0;
        var count = $(".car-count", c);
        var dotsBox = $(".car-dots", c);
        var autoBtn = $(".car-auto", c);
        var timer = null;
        var dots = [];

        if (dotsBox) {
            dots = slides.map(function (_, i) {
                var d = document.createElement("button");
                d.type = "button";
                d.className = "car-dot";
                d.setAttribute(
                    "aria-label",
                    "Ir a la diapositiva " + (i + 1)
                );

                d.addEventListener("click", function () {
                    go(i);
                });

                dotsBox.appendChild(d);
                return d;
            });
        }

        function paint() {
            if (count) count.textContent = (idx + 1) + " / " + n;

            dots.forEach(function (d, i) {
                d.setAttribute("aria-current", i === idx ? "true" : "false");
            });
        }

        function go(i) {
            idx = (i + n) % n;

            track.scrollTo({
                left: slides[idx].offsetLeft - track.offsetLeft,
                behavior: reduce ? "auto" : "smooth"
            });

            paint();
        }

        function current() {
            var best = 0;
            var min = Infinity;

            slides.forEach(function (s, i) {
                var d = Math.abs(
                    s.offsetLeft - track.offsetLeft - track.scrollLeft
                );

                if (d < min) {
                    min = d;
                    best = i;
                }
            });

            return best;
        }

        var st;

        track.addEventListener("scroll", function () {
            clearTimeout(st);

            st = setTimeout(function () {
                idx = current();
                paint();
            }, 60);
        }, { passive: true });

        var prev = $(".car-prev", c);
        var next = $(".car-next", c);

        if (prev) {
            prev.addEventListener("click", function () {
                go(idx - 1);
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                go(idx + 1);
            });
        }

        track.addEventListener("keydown", function (e) {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                go(idx + 1);
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                go(idx - 1);
            }
        });

        /* Arrastre con ratón */
        var down = false;
        var sx = 0;
        var sl = 0;
        var moved = false;

        track.addEventListener("pointerdown", function (e) {
            if (e.pointerType !== "mouse") return;

            down = true;
            moved = false;
            sx = e.clientX;
            sl = track.scrollLeft;
        });

        window.addEventListener("pointermove", function (e) {
            if (!down) return;

            var dx = e.clientX - sx;

            if (Math.abs(dx) > 5) {
                moved = true;
                track.classList.add("dragging");
            }

            if (moved) track.scrollLeft = sl - dx;
        });

        window.addEventListener("pointerup", function () {
            if (!down) return;

            down = false;

            if (moved) {
                track.classList.remove("dragging");
                go(current());
            }
        });

        track.addEventListener("click", function (e) {
            if (moved) {
                e.stopPropagation();
                e.preventDefault();
                moved = false;
            }
        }, true);

        /* Avance automático opcional */
        function stop() {
            clearInterval(timer);
            timer = null;

            if (autoBtn) {
                autoBtn.setAttribute("aria-pressed", "false");
                autoBtn.textContent = "▶ Auto";
                autoBtn.setAttribute(
                    "aria-label",
                    "Activar avance automático"
                );
            }
        }

        function start() {
            if (reduce || !autoBtn) return;

            timer = setInterval(function () {
                go(idx + 1);
            }, 6000);

            autoBtn.setAttribute("aria-pressed", "true");
            autoBtn.textContent = "❚❚ Pausa";
            autoBtn.setAttribute(
                "aria-label",
                "Pausar avance automático"
            );
        }

        if (autoBtn) {
            autoBtn.addEventListener("click", function () {
                if (timer) {
                    stop();
                } else {
                    start();
                }
            });

            ["pointerdown", "focusin", "mouseenter"].forEach(function (ev) {
                c.addEventListener(ev, function () {
                    if (timer) stop();
                });
            });
        }

        paint();
    });

    /* ---------- Lightbox de imágenes ---------- */
    var lb = null;
    var lbItems = [];
    var lbI = 0;
    var lastFocus = null;

    function buildLb() {
        lb = document.createElement("div");
        lb.className = "lb";
        lb.setAttribute("role", "dialog");
        lb.setAttribute("aria-modal", "true");
        lb.setAttribute("aria-label", "Vista ampliada de imagen");

        lb.innerHTML =
            '<div class="lb-top">' +
                '<span class="lb-count" aria-live="polite"></span>' +
                '<button type="button" class="lb-btn lb-close" ' +
                    'aria-label="Cerrar vista ampliada">✕</button>' +
            '</div>' +
            '<button type="button" class="lb-btn lb-nav lb-prev" ' +
                'aria-label="Imagen anterior">‹</button>' +
            '<figure class="lb-fig">' +
                '<img alt="">' +
                '<figcaption class="lb-cap"></figcaption>' +
            '</figure>' +
            '<button type="button" class="lb-btn lb-nav lb-next" ' +
                'aria-label="Imagen siguiente">›</button>';

        document.body.appendChild(lb);

        $(".lb-close", lb).addEventListener("click", closeLb);

        $(".lb-prev", lb).addEventListener("click", function () {
            showLb(lbI - 1);
        });

        $(".lb-next", lb).addEventListener("click", function () {
            showLb(lbI + 1);
        });

        lb.addEventListener("click", function (e) {
            if (e.target === lb || e.target.classList.contains("lb-top")) {
                closeLb();
            }
        });

        var tx = null;

        lb.addEventListener("touchstart", function (e) {
            tx = e.touches[0].clientX;
        }, { passive: true });

        lb.addEventListener("touchend", function (e) {
            if (tx === null) return;

            var dx = e.changedTouches[0].clientX - tx;

            if (Math.abs(dx) > 50) {
                showLb(lbI + (dx < 0 ? 1 : -1));
            }

            tx = null;
        }, { passive: true });
    }

    function showLb(i) {
        if (!lbItems.length || !lb) return;

        lbI = (i + lbItems.length) % lbItems.length;

        var el = lbItems[lbI];
        var im = $("img", lb);

        im.src = el.currentSrc || el.src;
        im.alt = el.alt;

        $(".lb-cap", lb).textContent =
            el.getAttribute("data-caption") || el.alt;

        $(".lb-count", lb).textContent =
            lbItems.length > 1 ? (lbI + 1) + " / " + lbItems.length : "";

        var multi = lbItems.length > 1;

        $(".lb-prev", lb).style.display = multi ? "" : "none";
        $(".lb-next", lb).style.display = multi ? "" : "none";
    }

    function openLb(el) {
        if (!lb) buildLb();

        var g = el.getAttribute("data-group");

        lbItems = $$('img[data-lightbox][data-group="' + g + '"]');
        lastFocus = document.activeElement;

        lb.classList.add("open");
        document.body.style.overflow = "hidden";

        showLb(lbItems.indexOf(el));
        $(".lb-close", lb).focus();
    }

    function closeLb() {
        if (!lb) return;

        lb.classList.remove("open");
        document.body.style.overflow = "";

        if (lastFocus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
        var t = e.target;

        if (t.matches && t.matches("img[data-lightbox]")) {
            e.preventDefault();
            openLb(t);
        }
    });

    document.addEventListener("keydown", function (e) {
        if (!lb || !lb.classList.contains("open")) return;

        if (e.key === "Escape") {
            closeLb();
        } else if (e.key === "ArrowRight") {
            showLb(lbI + 1);
        } else if (e.key === "ArrowLeft") {
            showLb(lbI - 1);
        } else if (e.key === "Tab") {
            var f = $$("button", lb).filter(function (b) {
                return b.offsetParent !== null;
            });

            var first = f[0];
            var last = f[f.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });

    /* ---------- Pestañas ---------- */
    $$("[data-tabs]").forEach(function (box) {
        var tabs = $$('[role="tab"]', box);
        var panels = $$('[role="tabpanel"]', box);

        if (!tabs.length) return;

        function sel(t, focus) {
            tabs.forEach(function (x) {
                var on = x === t;

                x.setAttribute("aria-selected", on ? "true" : "false");
                x.tabIndex = on ? 0 : -1;
            });

            panels.forEach(function (p) {
                p.hidden = p.id !== t.getAttribute("aria-controls");
            });

            if (focus) t.focus();
        }

        tabs.forEach(function (t, i) {
            t.addEventListener("click", function () {
                sel(t);
            });

            t.addEventListener("keydown", function (e) {
                if (e.key === "ArrowRight") {
                    sel(tabs[(i + 1) % tabs.length], true);
                } else if (e.key === "ArrowLeft") {
                    sel(tabs[(i - 1 + tabs.length) % tabs.length], true);
                } else if (e.key === "Home") {
                    sel(tabs[0], true);
                } else if (e.key === "End") {
                    sel(tabs[tabs.length - 1], true);
                }
            });
        });

        sel(tabs[0]);
    });

    /* ---------- Filtros ---------- */
    $$("[data-filter-group]").forEach(function (g) {
        var target = $(g.getAttribute("data-filter-group"));

        if (!target) return;

        var btns = $$("button", g);
        var items = $$("[data-cat]", target);
        var out = $("[data-filter-count]");

        btns.forEach(function (b) {
            b.addEventListener("click", function () {
                var f = b.getAttribute("data-filter");
                var n = 0;

                btns.forEach(function (x) {
                    x.setAttribute(
                        "aria-pressed",
                        x === b ? "true" : "false"
                    );
                });

                items.forEach(function (it) {
                    var cat = (it.getAttribute("data-cat") || "").split(" ");
                    var show = f === "todas" || cat.indexOf(f) > -1;

                    it.hidden = !show;
                    if (show) n++;
                });

                if (out) {
                    out.textContent =
                        n + (n === 1 ? " aplicación" : " aplicaciones");
                }
            });
        });
    });

    /* ---------- Contacto desde config.js ---------- */
    var C = window.SAMKANELI_CONFIG || {};

    function ok(v) {
        return typeof v === "string" && v.trim() !== "";
    }

    $$("[data-contact]").forEach(function (a) {
        var k = a.getAttribute("data-contact");
        var v = C[k];
        var href = null;

        if (!ok(v)) return;

        if (k === "whatsapp") {
            href = "https://wa.me/" + v.replace(/\D/g, "") +
                "?text=" + encodeURIComponent(C.mensajeWhatsapp || "");
        } else if (k === "email") {
            href = "mailto:" + v;
        } else {
            href = v;
        }

        a.setAttribute("href", href);

        if (k !== "email") {
            a.setAttribute("target", "_blank");
            a.setAttribute("rel", "noopener noreferrer");
        }

        a.classList.add("is-active");
    });

    $$("[data-contact-text]").forEach(function (el) {
        var k = el.getAttribute("data-contact-text");
        var v = C[k];

        if (ok(v)) {
            el.textContent = v;
            el.classList.remove("pending");
        }
    });

    $$("[data-contact-status]").forEach(function (el) {
        var k = el.getAttribute("data-contact-status");

        el.hidden = !(
            ok(C[k]) === (el.getAttribute("data-when") === "set")
        );
    });

    /* ---------- Copiar color ---------- */
    $$("[data-copy]").forEach(function (b) {
        b.addEventListener("click", function () {
            var t = b.getAttribute("data-copy");
            var lab = b.getAttribute("data-label") || b.textContent;

            function done() {
                b.textContent = "¡Copiado!";
                setTimeout(function () {
                    b.textContent = lab;
                }, 1400);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(t).then(done, function () {
                    b.textContent = t;
                });
            } else {
                var ta = document.createElement("textarea");
                ta.value = t;
                document.body.appendChild(ta);
                ta.select();

                try {
                    document.execCommand("copy");
                    done();
                } catch (_) {
                    b.textContent = t;
                }

                document.body.removeChild(ta);
            }
        });
    });

    /* ---------- Video opcional ---------- */
    $$("[data-video-slot]").forEach(function (box) {
        var btn = $(".video-play", box);
        var note = $(".video-note", box);
        var src = box.getAttribute("data-video-slot");

        if (!btn) return;

        btn.addEventListener("click", function () {
            var stage = $(".video-stage", box);

            if (!stage) return;

            var v = document.createElement("video");
            v.controls = true;
            v.playsInline = true;
            v.preload = "metadata";
            v.className = "video-el";

            v.setAttribute(
                "aria-label",
                "Video de presentación de SAMKANELI"
            );

            v.addEventListener("error", function () {
                v.remove();
                btn.hidden = false;

                if (note) note.hidden = false;
            }, { once: true });

            v.src = src;
            stage.appendChild(v);
            btn.hidden = true;

            if (note) note.hidden = true;

            var p = v.play();
            if (p && p.catch) p.catch(function () {});
        });
    });

    /* ---------- Formulario de contacto: demostración local ---------- */
    $$("form[data-demo-form]").forEach(function (f) {
        var msg = $(".form-msg", f);

        f.addEventListener("submit", function (e) {
            e.preventDefault();

            var bad = null;

            $$("[required]", f).forEach(function (i) {
                var err = i.id ? $("#" + i.id + "-err") : null;

                var v = !i.value.trim() ||
                    (i.type === "email" && i.value &&
                        !/^\S+@\S+\.\S+$/.test(i.value));

                i.setAttribute("aria-invalid", v ? "true" : "false");

                if (err) err.hidden = !v;
                if (v && !bad) bad = i;
            });

            if (bad) {
                if (msg) {
                    msg.textContent = "Revisa los campos marcados.";
                    msg.className = "form-msg err";
                }

                bad.focus();
                return;
            }

            if (msg) {
                msg.textContent =
                    "Demostración visual: tu mensaje NO se envió a ningún servidor. " +
                    "Para recibir consultas reales, activa un canal en config.js.";

                msg.className = "form-msg ok";
            }

            f.reset();
        });
    });

    /* ---------- Valores corporativos SAMKANELI ---------- */
    var valoresBox = $("#valores-corporativos");

    if (valoresBox) {
        var opcionesValor = $$(".sk-valor-opcion", valoresBox);
        var panelValor = $(".sk-valor-detalle", valoresBox);
        var fotoValor = $("#sk-valor-foto", valoresBox);
        var numeroValor = $("#sk-valor-numero", valoresBox);
        var tituloValor = $("#sk-valor-titulo", valoresBox);
        var descripcionValor = $("#sk-valor-descripcion", valoresBox);
        var fraseValor = $("#sk-valor-frase", valoresBox);
        var progresoValor = $("#sk-valor-progreso", valoresBox);
        var anteriorValor = $("#sk-valor-anterior", valoresBox);
        var siguienteValor = $("#sk-valor-siguiente", valoresBox);

        var datosValores = [
            {
                titulo: "Calidad",
                imagen: "../img/originales/Certificado de Calidad Samkaneli Tropical.png",
                alt: "Rollos de canela de SAMKANELI",
                descripcion:
                    "Cuidamos cada detalle para ofrecer productos deliciosos, " +
                    "con una presentación especial y una experiencia que invite a compartir.",
                frase: "Cada detalle cuenta; cada sabor deja una huella."
            },
            {
                titulo: "Responsabilidad",
                imagen: "../img/mockups/Rollos de canela tropicales al horno.png",
                alt: "Producto inspirado en los sabores de la Selva Central",
                descripcion:
                    "Trabajamos con cuidado y responsabilidad en cada etapa " +
                    "de la preparación, presentación y atención a nuestros clientes.",
                frase: "La confianza se construye con acciones responsables."
            },
            {
                titulo: "Respeto",
                imagen: "../img/originales/Entrega dulce en Samkaneli.png",
                alt: "Rollo de canela con cobertura frutal",
                descripcion:
                    "Valoramos a las personas, escuchamos sus ideas y reconocemos " +
                    "la riqueza cultural y gastronómica de nuestra región.",
                frase: "El respeto nos acerca y nos ayuda a crecer juntos."
            },
            {
                titulo: "Compromiso",
                imagen: "../img/mockups/fondo-aplicaciones.png",
                alt: "Productos artesanales de SAMKANELI",
                descripcion:
                    "Nos esforzamos por cumplir nuestros compromisos y ofrecer " +
                    "una experiencia agradable desde el pedido hasta la entrega.",
                frase: "Ponemos dedicación en cada producto y cada encuentro."
            },
            {
                titulo: "Innovación",
                imagen: "../img/mockups/envultura.jpeg",
                alt: "Sabores frutales de SAMKANELI",
                ajuste: "contain",         /* imagen completa */
                posicion: "left center",   /* pegada a la izquierda */
                descripcion:
                    "Creamos combinaciones y presentaciones inspiradas en frutas " +
                    "de nuestra Selva Central para ofrecer experiencias diferentes.",
                frase: "La creatividad convierte nuestros sabores en experiencias."
            }
        ];

        if (
            opcionesValor.length &&
            panelValor &&
            fotoValor &&
            numeroValor &&
            tituloValor &&
            descripcionValor &&
            fraseValor &&
            progresoValor &&
            anteriorValor &&
            siguienteValor
        ) {
            var indiceValorActual = 0;

            var cambiarValor = function (indice) {
                indiceValorActual =
                    (indice + datosValores.length) % datosValores.length;

                var dato = datosValores[indiceValorActual];

                opcionesValor.forEach(function (boton, i) {
                    var seleccionado = i === indiceValorActual;

                    boton.classList.toggle("activa", seleccionado);
                    boton.setAttribute(
                        "aria-pressed",
                        seleccionado ? "true" : "false"
                    );
                });

                numeroValor.textContent =
                    String(indiceValorActual + 1).padStart(2, "0");

                tituloValor.textContent = dato.titulo;
                descripcionValor.textContent = dato.descripcion;
                fraseValor.textContent = dato.frase;

                progresoValor.textContent =
                    String(indiceValorActual + 1).padStart(2, "0") +
                    " / " +
                    String(datosValores.length).padStart(2, "0");

                fotoValor.onerror = function () {
                    console.error(
                        "No se pudo cargar la fotografía:",
                        dato.imagen
                    );
                };

                fotoValor.src = dato.imagen;
                fotoValor.alt = dato.alt;

                /* Ajuste propio de cada imagen (si no lo tiene, vuelve al estilo del CSS) */
                fotoValor.style.objectFit = dato.ajuste || "";
                fotoValor.style.objectPosition = dato.posicion || "";

                panelValor.classList.remove("cambiando");
                void panelValor.offsetWidth;
                panelValor.classList.add("cambiando");
            };

            opcionesValor.forEach(function (boton, indice) {
                boton.addEventListener("click", function () {
                    cambiarValor(indice);
                });
            });

            anteriorValor.addEventListener("click", function () {
                cambiarValor(indiceValorActual - 1);
            });

            siguienteValor.addEventListener("click", function () {
                cambiarValor(indiceValorActual + 1);
            });

            cambiarValor(0);
        } else {
            console.warn(
                "Valores SAMKANELI: faltan elementos del HTML interactivo."
            );
        }
    }

})();

(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const cards = $$(".m-card");
  const panels = $$(".panel");
  const bar = $(".prog i");
  const prev = $("#prev");
  const next = $("#next");
  const tabulacion = $("#tabulacion");

  let cur = 0;

  /* Tabulación de la encuesta (10 personas) */
  const L = ["Excelente", "Bueno", "Regular", "Malo"];

  const T = [
    ["Variedad de postres y productos que ofrece SAMKANELI", [2, 7, 1, 0]],
    ["Presentación de los productos", [0, 9, 1, 0]],
    ["Amabilidad del personal durante la atención", [1, 8, 0, 1]],
    ["Precios en relación con la calidad", [1, 6, 3, 0]],
    ["Experiencia general de compra y consumo", [2, 8, 0, 0]]
  ];

  /* Generar las preguntas solo si existe el contenedor */
  if (tabulacion) {
    tabulacion.innerHTML = T.map(([q, d], i) =>
      `<div class="tab-q">
        <h4>Pregunta ${i + 1}: ${q}</h4>` +
      d.map((v, k) =>
        `<div class="bar">
          <span>${L[k]}</span>
          <span class="track">
            <span class="fill f${k}" data-w="${v * 10}" style="--k:${k}"></span>
          </span>
          <b>${v} · ${v * 10}%</b>
        </div>`
      ).join("") +
      `</div>`
    ).join("");
  }

  /* Animación de las barras */
  const grow = () => {
    if (!tabulacion) return;

    $$("#tabulacion .fill").forEach(f => {
      f.style.width = "0";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          f.style.width = f.dataset.w + "%";
        });
      });
    });
  };

  /* Mostrar sección */
  function show(i, scroll) {
    if (!cards.length || !panels.length) return;

    cur = Math.max(0, Math.min(panels.length - 1, i));

    cards.forEach((c, k) => {
      c.setAttribute("aria-selected", k === cur ? "true" : "false");
      c.tabIndex = k === cur ? 0 : -1;
    });

    panels.forEach((p, k) => {
      p.classList.toggle("on", k === cur);
    });

    if (bar) {
      bar.style.width = ((cur + 1) / panels.length * 100) + "%";
    }

    if (prev) prev.hidden = cur === 0;
    if (next) next.hidden = cur === panels.length - 1;

    if (cur === 4) grow();

    $$(".rev", panels[cur]).forEach((e, k) => {
      e.classList.remove("vis");

      setTimeout(() => {
        e.classList.add("vis");
      }, 80 + k * 90);
    });

    history.replaceState(null, "", "#seccion-" + (cur + 1));

    if (scroll) {
      panels[cur].scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  /* Clic en los nueve cuadritos */
  cards.forEach((c, k) => {
    c.addEventListener("click", () => show(k, true));

    c.addEventListener("keydown", e => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        show(k + 1, false);
        cards[cur].focus();
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        show(k - 1, false);
        cards[cur].focus();
      }

      if (e.key === "Home") {
        e.preventDefault();
        show(0, false);
        cards[cur].focus();
      }

      if (e.key === "End") {
        e.preventDefault();
        show(cards.length - 1, false);
        cards[cur].focus();
      }
    });
  });

  /* Botones anterior y siguiente */
  if (prev) {
    prev.addEventListener("click", () => show(cur - 1, true));
  }

  if (next) {
    next.addEventListener("click", () => show(cur + 1, true));
  }

  /* Abrir la sección indicada en el enlace */
  const m = location.hash.match(/seccion-(\d+)/);
  const initial = m ? Number(m[1]) - 1 : 0;

  show(initial, false);

})();
/* ---------- Gráficos circulares de las tabulaciones ---------- */
(function () {
  "use strict";

  const colores = [
    "#f4a6c1",
    "#f8c8d9",
    "#c9e8b6",
    "#e9d8a6"
  ];

  const preguntas = document.querySelectorAll("#seccion-5 .tab-q");

  preguntas.forEach((pregunta, indice) => {
    const tabla = pregunta.querySelector("table.tab");
    if (!tabla) return;

    const contenedor = pregunta.querySelector(".tbl-wrap");
    if (!contenedor) return;

    const filas = Array.from(tabla.querySelectorAll("tbody tr"));

    const datos = filas.map(fila => ({
      nombre: fila.cells[0]?.textContent.trim() || "",
      valor: Number(fila.cells[1]?.textContent.trim()) || 0
    }));

    const total = datos.reduce((suma, dato) => suma + dato.valor, 0);
    if (!total) return;

    let acumulado = 0;

    const segmentos = datos.map((dato, i) => {
      const inicio = acumulado;
      acumulado += dato.valor / total * 100;

      return `${colores[i]} ${inicio}% ${acumulado}%`;
    });

    const layout = document.createElement("div");
    layout.className = "tab-chart-layout";

    const grafico = document.createElement("div");
    grafico.className = "tab-chart-card";

    grafico.innerHTML = `
      <h5>Pregunta ${indice + 1}</h5>
      <div class="tab-pie"
           style="background: conic-gradient(${segmentos.join(",")})">
      </div>
      <div class="tab-legend">
        ${datos.map((dato, i) => `
          <div class="tab-legend-item">
            <span class="tab-legend-color"
                  style="background:${colores[i]}"></span>
            <span>${dato.nombre}: ${dato.valor * 10}%</span>
          </div>
        `).join("")}
      </div>
    `;

    contenedor.parentNode.insertBefore(layout, contenedor);
    layout.appendChild(contenedor);
    layout.appendChild(grafico);
  });
})();
/* Gráfico de tiempos de respuesta */
(function () {
  var g = document.getElementById("tr");
  if (!g || !("IntersectionObserver" in window)) return;

  var m = g.closest(".tr-marco") || g;
  g.classList.add("wait");
  m.classList.add("wait");

  var vals = g.querySelectorAll(".tr-val");
  vals.forEach(function (v) { v.textContent = "0 min"; });

  function contar() {
    vals.forEach(function (v, i) {
      var fin = +v.dataset.n, t0 = null, d = i * 200 + 1500;
      requestAnimationFrame(function paso(t) {
        if (!t0) t0 = t;
        var p = Math.min(Math.max((t - t0 - d) / 900, 0), 1);
        v.textContent = Math.round(fin * p) + " min";
        if (p < 1) requestAnimationFrame(paso);
      });
    });
  }

  new IntersectionObserver(function (e, o) {
    if (e[0].isIntersecting) {
      g.classList.remove("wait");
      m.classList.remove("wait");
      contar();
      o.disconnect();
    }
  }, { threshold: 0.3 }).observe(m);
})();
/* ==========================================================================
   SAMKANELI · Imagología, Iconología e Imagen verbal
   Pegar AL FINAL de script.js. Solo actúa en <body data-page="identidad-marca">.
   Índice: 1 Revelado · 2 Filas de tabla · 3 Scroll (progreso y fondos) · 4 Anclas
           5 Parallax del cursor · 6 Clic en símbolos · 7 Lightbox · 8 Sección activa
           9 Escape · 10 Estilos del script · 11 Arranque
   ========================================================================== */
(function () {
  'use strict';

  if (!document.body || document.body.getAttribute('data-page') !== 'identidad-marca') return;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tactil = window.matchMedia && matchMedia('(hover: none)').matches;

  /* Ejecuta cada módulo aparte: si uno falla, los demás siguen funcionando */
  function run(fn) {
    try { fn(); } catch (e) { if (window.console) console.warn('[SAMKANELI] ' + fn.name, e); }
  }

  /* Hace que un elemento responda a clic y a teclado (Enter / Espacio) */
  function activable(el, fn, etiqueta) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    if (etiqueta) el.setAttribute('aria-label', etiqueta);
    el.style.cursor = 'pointer';
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
    });
  }

  /* ---------- 1. REVELADO AL HACER SCROLL (.reveal → .visible) ---------- */
  function initRevelado() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (items, o) {
      items.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add('visible'); o.unobserve(it.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { if (!e.classList.contains('visible')) io.observe(e); });
  }

  /* ---------- 2. FILAS DE LAS TABLAS: entran una tras otra ---------- */
  function initFilasTabla() {
    if (reduce || !('IntersectionObserver' in window)) return;
    $$('.iv-table-wrap').forEach(function (wrap) {
      var filas = $$('tbody tr', wrap);
      filas.forEach(function (tr) {
        tr.style.opacity = '0';
        tr.style.transform = 'translateX(-24px)';
        tr.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.3,1.4,.5,1)';
      });
      var io = new IntersectionObserver(function (items, o) {
        if (!items[0].isIntersecting) return;
        filas.forEach(function (tr, i) {
          setTimeout(function () { tr.style.opacity = '1'; tr.style.transform = 'none'; }, i * 90 + 150);
        });
        o.disconnect();
      }, { threshold: 0.2 });
      io.observe(wrap);
    });
  }

  /* ---------- 3. SCROLL: barra de progreso, foto y fondos con profundidad ---------- */
  function initScroll() {
    var barra = document.createElement('div');
    barra.setAttribute('aria-hidden', 'true');
    barra.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:4px;z-index:2000;pointer-events:none;' +
      'transform-origin:left;transform:scaleX(0);box-shadow:0 0 10px rgba(250,173,192,.8);' +
      'background:linear-gradient(90deg,#FAADC0,#C0E3A1,#7A4326)';
    document.body.appendChild(barra);

    var foto = $('.iv-hero-image');
    var fondos = $$('.iv-verbal-banner, .iv-exercise-art');
    var esperando = false;

    function actualizar() {
      esperando = false;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = 'scaleX(' + (total > 0 ? window.pageYOffset / total : 0) + ')';
      if (reduce) return;
      if (foto && window.pageYOffset < window.innerHeight * 1.2) {
        foto.style.translate = '0 ' + (window.pageYOffset * 0.06).toFixed(1) + 'px';
      }
      fondos.forEach(function (f) {
        var r = f.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
        f.style.backgroundPosition = 'center, 50% ' + (20 + p * 60).toFixed(1) + '%';
      });
    }
    window.addEventListener('scroll', function () {
      if (!esperando) { esperando = true; requestAnimationFrame(actualizar); }
    }, { passive: true });
    window.addEventListener('resize', actualizar);
    actualizar();
  }

  /* ---------- 4. ENLACES INTERNOS (#imagologia, #iconologia...) con desplazamiento suave ---------- */
  function initAnclas() {
    $$('a[href^="#"]').forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      a.addEventListener('click', function (e) {
        var destino = document.getElementById(id);
        if (!destino) return;
        e.preventDefault();
        var cab = $('.site-header');
        var y = destino.getBoundingClientRect().top + window.pageYOffset - ((cab ? cab.offsetHeight : 0) + 12);
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
        if (history.pushState) history.pushState(null, '', '#' + id);
        destino.setAttribute('tabindex', '-1');
        destino.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- 5. PARALLAX DE LA PORTADA según el cursor ---------- */
  function initParallax() {
    var hero = $('.iv-hero');
    if (!hero || reduce || tactil) return;
    var capas = [];
    var img = $('.iv-hero-image img', hero);
    var sello = $('.iv-sticker', hero);
    if (img) capas.push({ el: img, d: 14 });
    if (sello) capas.push({ el: sello, d: 32 });
    $$('.iv-leaf', hero).forEach(function (h, i) { capas.push({ el: h, d: 18 + i * 12 }); });

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function pintar() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      capas.forEach(function (c) {
        c.el.style.translate = (cx * c.d).toFixed(1) + 'px ' + (cy * c.d).toFixed(1) + 'px';
      });
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(pintar) : null;
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(pintar);
    });
    hero.addEventListener('pointerleave', function () {
      tx = 0; ty = 0;
      if (!raf) raf = requestAnimationFrame(pintar);
    });
  }

  /* ---------- 6. CLIC EN SÍMBOLOS, SELLO Y MASCOTA ---------- */
  function explosion(cont, x, y, emoji) {
    if (reduce || !cont.animate) return;
    for (var i = 0; i < 8; i++) {
      (function (i) {
        var p = document.createElement('span');
        p.textContent = emoji;
        p.setAttribute('aria-hidden', 'true');
        p.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;margin:-.7rem 0 0 -.7rem;' +
          'font-size:1.4rem;line-height:1;pointer-events:none;z-index:5';
        cont.appendChild(p);
        var ang = Math.PI * 2 * i / 8, dist = 70 + Math.random() * 40;
        p.animate([
          { transform: 'translate(0,0) scale(.4)', opacity: 1 },
          { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + Math.sin(ang) * dist + 'px) scale(1.2)', opacity: 0 }
        ], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = function () { p.remove(); };
      })(i);
    }
  }
  function centroEn(cont, el) {
    var rc = cont.getBoundingClientRect(), re = el.getBoundingClientRect();
    return { x: re.left - rc.left + re.width / 2, y: re.top - rc.top + re.height / 2 };
  }

  function initClics() {
    /* Tarjetas de símbolos: el emoji salta y suelta pequeñas copias */
    $$('.iv-symbol-card').forEach(function (card) {
      var sim = $('.symbol', card), tit = $('h3', card);
      if (!sim) return;
      activable(card, function () {
        if (reduce) return;
        sim.animate([
          { transform: 'scale(1) rotate(0)' },
          { transform: 'scale(1.45) rotate(-20deg)' },
          { transform: 'scale(1) rotate(0)' }
        ], { duration: 650, easing: 'cubic-bezier(.3,1.5,.5,1)' });
        var c = centroEn(card, sim);
        explosion(card, c.x, c.y, sim.textContent.trim());
      }, 'Ver animación de: ' + (tit ? tit.textContent : 'símbolo'));
    });

    /* Sello circular de la portada: gira */
    var sello = $('.iv-sticker');
    if (sello && sello.animate) {
      activable(sello, function () {
        if (reduce) return;
        sello.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 900, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      }, 'Girar el sello');
    }

    /* Mascota: salta y suelta corazones */
    $$('img[src*="mascota"]').forEach(function (m) {
      var cont = m.closest('.iv-card, .iv-conclusion-box') || m.parentElement;
      if (!cont) return;
      activable(m, function () {
        if (reduce) return;
        m.animate([{ translate: '0 0' }, { translate: '0 -34px' }, { translate: '0 0' }],
          { duration: 650, easing: 'cubic-bezier(.3,1.5,.5,1)' });
        var c = centroEn(cont, m);
        explosion(cont, c.x, c.y, '💗');
      }, 'Saludar a la mascota de SAMKANELI');
    });
  }

  /* ---------- 7. LIGHTBOX propio (clases iv-lb, no choca con el de otras páginas) ---------- */
  function initLightbox() {
    var imgs = $$('.iv-hero-image img, .iv-photo-wide, .iv-symbol-main > img, .iv-image-card img');
    if (!imgs.length) return;

    var ov = document.createElement('div');
    ov.className = 'iv-lb';
    ov.hidden = true;
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Imagen ampliada');
    ov.innerHTML = '<button type="button" class="iv-lb-x" aria-label="Cerrar">✕</button>' +
      '<button type="button" class="iv-lb-p" aria-label="Imagen anterior">‹</button>' +
      '<figure class="iv-lb-f"><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="iv-lb-n" aria-label="Imagen siguiente">›</button>';
    document.body.appendChild(ov);

    var foto = $('img', ov), cap = $('figcaption', ov), botones = $$('button', ov);
    var actual = 0, previo = null, x0 = null;

    function mostrar(i) {
      actual = (i + imgs.length) % imgs.length;
      var o = imgs[actual];
      foto.src = o.currentSrc || o.src;
      foto.alt = o.alt || '';
      cap.textContent = o.alt || '';
      if (!reduce && foto.animate) {
        foto.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
      }
    }
    function abrir(i) {
      previo = document.activeElement;
      ov.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      mostrar(i);
      $('.iv-lb-x', ov).focus();
    }
    function cerrar() {
      ov.hidden = true;
      document.documentElement.style.overflow = '';
      foto.removeAttribute('src');
      if (previo && previo.focus) previo.focus();
    }

    imgs.forEach(function (img, i) {
      img.setAttribute('data-iv-zoom', '');
      activable(img, function () { abrir(i); }, 'Ampliar imagen: ' + (img.alt || 'fotografía'));
    });

    $('.iv-lb-x', ov).addEventListener('click', cerrar);
    $('.iv-lb-p', ov).addEventListener('click', function () { mostrar(actual - 1); });
    $('.iv-lb-n', ov).addEventListener('click', function () { mostrar(actual + 1); });
    ov.addEventListener('click', function (e) { if (e.target === ov) cerrar(); });

    document.addEventListener('keydown', function (e) {
      if (ov.hidden) return;
      if (e.key === 'Escape') cerrar();
      else if (e.key === 'ArrowLeft') mostrar(actual - 1);
      else if (e.key === 'ArrowRight') mostrar(actual + 1);
      else if (e.key === 'Tab') {                       /* mantiene el foco dentro de la ventana */
        var i = botones.indexOf(document.activeElement);
        e.preventDefault();
        botones[(i + (e.shiftKey ? -1 : 1) + botones.length) % botones.length].focus();
      }
    });

    /* Deslizar con el dedo en celulares */
    ov.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    ov.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostrar(actual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- 8. SECCIÓN ACTIVA en el submenú "Identidad de marca" ---------- */
  function initSeccionActiva() {
    if (!('IntersectionObserver' in window)) return;
    var enlaces = $$('.sub a[href^="#"]');
    if (!enlaces.length) return;
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (!it.isIntersecting) return;
        enlaces.forEach(function (a) {
          if (a.getAttribute('href') === '#' + it.target.id) a.setAttribute('aria-current', 'location');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    ['imagologia', 'iconologia', 'imagen-verbal'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  /* ---------- 9. ESCAPE cierra el menú móvil y los submenús ---------- */
  function initEscape() {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var nav = $('.nav'), tog = $('.nav-toggle');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        if (tog) { tog.setAttribute('aria-expanded', 'false'); tog.focus(); }
      }
      $$('.has-sub.open').forEach(function (s) {
        s.classList.remove('open');
        var b = $('.sub-btn', s);
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 10. ESTILOS MÍNIMOS que usa este script (lightbox y sección activa) ---------- */
  function inyectarEstilos() {
    if ($('#iv-js-estilos')) return;
    var st = document.createElement('style');
    st.id = 'iv-js-estilos';
    st.textContent =
      '.iv-lb{position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;padding:3rem 1rem;' +
        'background:rgba(78,42,21,.88);backdrop-filter:blur(8px);animation:ivlb .3s ease}' +
      '.iv-lb[hidden]{display:none}' +
      '.iv-lb-f{margin:0;max-width:min(1100px,92vw);text-align:center}' +
      '.iv-lb-f img{max-width:100%;max-height:78vh;object-fit:contain;background:#fff;border:6px solid #fff;border-radius:28px;box-shadow:0 30px 70px rgba(0,0,0,.45)}' +
      '.iv-lb-f figcaption{margin-top:.9rem;color:#FFEED6;font-family:Nunito,sans-serif;font-weight:700}' +
      '.iv-lb button{position:absolute;width:46px;height:46px;border:0;border-radius:50%;background:#FAADC0;color:#4E2A15;font-size:1.4rem;font-weight:800;cursor:pointer;' +
        'transition:transform .25s cubic-bezier(.3,1.5,.5,1),background .25s}' +
      '.iv-lb button:hover{background:#C0E3A1;transform:scale(1.12)}' +
      '.iv-lb-x{top:1rem;right:1rem}.iv-lb-p{left:1rem;top:50%;margin-top:-23px}.iv-lb-n{right:1rem;top:50%;margin-top:-23px}' +
      '@keyframes ivlb{from{opacity:0}}' +
      'img[data-iv-zoom]{cursor:zoom-in}' +
      '.sub a[aria-current="location"]{color:#D9588F!important}' +
      '@media(prefers-reduced-motion:reduce){.iv-lb{animation:none}}';
    document.head.appendChild(st);
  }

  /* ---------- 11. ARRANQUE ---------- */
  function iniciar() {
    [inyectarEstilos, initRevelado, initFilasTabla, initScroll, initAnclas,
     initParallax, initClics, initLightbox, initSeccionActiva, initEscape].forEach(run);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
/* ==========================================================================
   SAMKANELI · Imagología, Iconología e Imagen verbal (clases sk-*)
   Pegar AL FINAL de script.js. Solo actúa si existe .sk-cover en la página.
   Reutiliza lo que ya hace script.js: menú, .reveal y lightbox [data-lightbox].
   Índice: 1 Barra de progreso · 2 Parallax · 3 Cascada · 4 Paleta (copiar HEX)
           5 Símbolos · 6 Sello · 7 Ejercicio · 8 Volver arriba · 9 Estilos · 10 Arranque
   ========================================================================== */
(function () {
  'use strict';

  if (!document.querySelector('.sk-cover')) return;

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tactil = window.matchMedia && matchMedia('(hover: none)').matches;

  /* Cada módulo corre aparte: si uno falla, los demás siguen */
  function run(fn) {
    try { fn(); } catch (e) { if (window.console) console.warn('[SAMKANELI] ' + fn.name, e); }
  }

  /* Hace que un elemento responda a clic y a teclado (Enter / Espacio) */
  function activable(el, fn, etiqueta) {
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    if (etiqueta) el.setAttribute('aria-label', etiqueta);
    el.style.cursor = 'pointer';
    el.addEventListener('click', fn);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
    });
  }

  /* Mensaje flotante pequeño */
  var tt;
  function aviso(texto) {
    var t = $('#sk-aviso');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sk-aviso';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.textContent = texto;
    t.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () { t.classList.remove('on'); }, 1800);
  }

  /* Chispas / emojis que salen de un punto dentro de un contenedor */
  function explosion(cont, x, y, emoji) {
    if (reduce || !cont.animate) return;
    for (var i = 0; i < 8; i++) {
      (function (i) {
        var p = document.createElement('span');
        p.textContent = emoji;
        p.setAttribute('aria-hidden', 'true');
        p.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;margin:-.7rem 0 0 -.7rem;' +
          'font-size:1.3rem;line-height:1;pointer-events:none;z-index:6';
        cont.appendChild(p);
        var ang = Math.PI * 2 * i / 8, dist = 60 + Math.random() * 40;
        p.animate([
          { transform: 'translate(0,0) scale(.4)', opacity: 1 },
          { transform: 'translate(' + Math.cos(ang) * dist + 'px,' + Math.sin(ang) * dist + 'px) scale(1.2)', opacity: 0 }
        ], { duration: 850, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = function () { p.remove(); };
      })(i);
    }
  }
  function centroEn(cont, el) {
    var rc = cont.getBoundingClientRect(), re = el.getBoundingClientRect();
    return { x: re.left - rc.left + re.width / 2, y: re.top - rc.top + re.height / 2 };
  }

  /* ---------- 1. BARRA DE PROGRESO DEL SCROLL ---------- */
  function initProgreso() {
    var barra = document.createElement('div');
    barra.id = 'sk-progreso';
    barra.setAttribute('aria-hidden', 'true');
    document.body.appendChild(barra);
    var esperando = false;
    function pintar() {
      esperando = false;
      var total = document.documentElement.scrollHeight - window.innerHeight;
      barra.style.transform = 'scaleX(' + (total > 0 ? window.pageYOffset / total : 0) + ')';
    }
    window.addEventListener('scroll', function () {
      if (!esperando) { esperando = true; requestAnimationFrame(pintar); }
    }, { passive: true });
    window.addEventListener('resize', pintar);
    pintar();
  }

  /* ---------- 2. PARALLAX DE LA PORTADA (cursor + scroll) ---------- */
  function initParallax() {
    var cover = $('.sk-cover');
    if (!cover || reduce) return;

    var foto  = $('.sk-cover-photo .sk-image', cover);
    var sello = $('.sk-stamp', cover);
    var texto = $('.sk-cover-content', cover);
    var capas = [];
    if (foto)  capas.push({ el: foto,  d: 16, s: 0.05 });   /* d = cursor, s = scroll */
    if (sello) capas.push({ el: sello, d: 34, s: -0.03 });
    if (texto) capas.push({ el: texto, d: -8, s: 0 });
    if (!capas.length) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function pintar() {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      var sc = Math.min(window.pageYOffset, window.innerHeight * 1.2);
      capas.forEach(function (c) {
        c.el.style.translate = (cx * c.d).toFixed(1) + 'px ' + (cy * c.d + sc * c.s).toFixed(1) + 'px';
      });
      raf = (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) ? requestAnimationFrame(pintar) : null;
    }
    function pedir() { if (!raf) raf = requestAnimationFrame(pintar); }

    if (!tactil) {
      cover.addEventListener('pointermove', function (e) {
        var r = cover.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5;
        ty = (e.clientY - r.top) / r.height - 0.5;
        pedir();
      });
      cover.addEventListener('pointerleave', function () { tx = 0; ty = 0; pedir(); });
    }
    window.addEventListener('scroll', pedir, { passive: true });
    pedir();
  }

  /* ---------- 3. CASCADA: las tarjetas de cada grupo aparecen una tras otra ---------- */
  function initCascada() {
    var grupos = ['.sk-info-grid', '.sk-color-palette', '.sk-comparative-cards', '.sk-exercise-description', '.sk-symbol-list'];
    grupos.forEach(function (sel) {
      $$(sel).forEach(function (g) {
        $$(':scope > *', g).forEach(function (h, i) {
          var d = (i * 0.09).toFixed(2) + 's';
          h.style.transitionDelay = d;
          if (h.classList.contains('reveal')) h.style.animationDelay = d;
        });
      });
    });
  }

  /* ---------- 4. PALETA: clic para copiar el código HEX ---------- */
  function initPaleta() {
    $$('.sk-color').forEach(function (c) {
      var m = (c.textContent || '').match(/#[0-9A-Fa-f]{6}/);
      var nombre = $('strong', c);
      if (!m) return;
      var hex = m[0].toUpperCase();
      c.title = 'Clic para copiar ' + hex;
      activable(c, function () {
        function ok() { aviso(hex + ' copiado'); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(hex).then(ok, ok);
        } else {
          var a = document.createElement('textarea');
          a.value = hex;
          document.body.appendChild(a);
          a.select();
          try { document.execCommand('copy'); } catch (e) {}
          a.remove();
          ok();
        }
        var sw = $('.sk-color-swatch', c);
        if (sw && sw.animate && !reduce) {
          sw.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
            { duration: 520, easing: 'cubic-bezier(.3,1.5,.5,1)' });
        }
      }, 'Copiar el color ' + (nombre ? nombre.textContent : '') + ' ' + hex);
    });
  }

  /* ---------- 5. SÍMBOLOS: clic y teclado ---------- */
  function initSimbolos() {
    $$('.sk-symbol-item').forEach(function (it) {
      var icono = $('.sk-symbol-icon', it), tit = $('strong', it);
      if (!icono) return;
      activable(it, function () {
        if (reduce) return;
        icono.animate([
          { transform: 'scale(1) rotate(0)' },
          { transform: 'scale(1.5) rotate(-22deg)' },
          { transform: 'scale(1) rotate(0)' }
        ], { duration: 650, easing: 'cubic-bezier(.3,1.5,.5,1)' });
        var c = centroEn(it, icono);
        it.style.position = 'relative';
        explosion(it, c.x, c.y, icono.textContent.trim());
      }, 'Ver animación de: ' + (tit ? tit.textContent : 'símbolo'));
    });

    /* Imagotipo del panel rosa: salta y suelta corazones */
    var logo = $('.sk-symbol-visual img');
    if (logo) {
      activable(logo, function () {
        var panel = logo.closest('.sk-symbol-visual');
        if (!panel || reduce) return;
        logo.animate([{ translate: '0 0' }, { translate: '0 -30px' }, { translate: '0 0' }],
          { duration: 650, easing: 'cubic-bezier(.3,1.5,.5,1)' });
        var c = centroEn(panel, logo);
        explosion(panel, c.x, c.y, '💗');
      }, 'Saludar al imagotipo de SAMKANELI');
    }
  }

  /* ---------- 6. SELLO DE LA PORTADA: gira al hacer clic ---------- */
  function initSello() {
    var s = $('.sk-stamp');
    if (!s || !s.animate) return;
    activable(s, function () {
      if (reduce) return;
      s.animate([{ rotate: '0deg' }, { rotate: '360deg' }], { duration: 900, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    }, 'Girar el sello');
  }

  /* ---------- 7. EJERCICIO: la composición se anima al verla y se repite con clic ---------- */
  function initEjercicio() {
    var art = $('.sk-exercise-art');
    var palabras = $$('.sk-verbal-composition > span');
    if (!art || !palabras.length || reduce) return;

    function pausar(v) { palabras.forEach(function (p) { p.style.animationPlayState = v; }); }
    function repetir() {
      palabras.forEach(function (p) { p.style.animation = 'none'; });
      void art.offsetWidth;
      palabras.forEach(function (p) { p.style.animation = ''; p.style.animationPlayState = 'running'; });
    }

    if ('IntersectionObserver' in window) {
      pausar('paused');
      new IntersectionObserver(function (items, o) {
        if (items[0].isIntersecting) { repetir(); o.disconnect(); }
      }, { threshold: 0.35 }).observe(art);
    }
    activable(art, repetir, 'Repetir la animación de la composición');
    art.title = 'Clic para repetir la animación';
  }

  /* ---------- 8. "VOLVER AL INICIO": desplazamiento suave ---------- */
  function initVolver() {
    $$('.sk-back-top').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var destino = $('#portada') || $('main') || document.body;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        destino.setAttribute('tabindex', '-1');
        destino.focus({ preventScroll: true });
        if (history.replaceState) history.replaceState(null, '', '#portada');
      });
    });
  }

  /* ---------- 9. ESTILOS MÍNIMOS que usa este script ---------- */
  function inyectarEstilos() {
    if ($('#sk-js-estilos')) return;
    var st = document.createElement('style');
    st.id = 'sk-js-estilos';
    st.textContent =
      '#sk-progreso{position:fixed;top:0;left:0;width:100%;height:4px;z-index:2000;pointer-events:none;transform-origin:left;transform:scaleX(0);' +
        'background:linear-gradient(90deg,#FAADC0,#C0E3A1,#7A4326);box-shadow:0 0 10px rgba(250,173,192,.8)}' +
      '#sk-aviso{position:fixed;left:50%;bottom:28px;z-index:2100;padding:12px 22px;border-radius:99px;background:#4E2A15;color:#FFEED6;' +
        'font:800 .9rem Nunito,sans-serif;box-shadow:0 14px 30px rgba(0,0,0,.3);opacity:0;pointer-events:none;' +
        'transform:translate(-50%,24px);transition:opacity .3s,transform .4s cubic-bezier(.3,1.5,.5,1)}' +
      '#sk-aviso.on{opacity:1;transform:translate(-50%,0)}' +
      '.sk-color:focus-visible,.sk-symbol-item:focus-visible,.sk-stamp:focus-visible,.sk-exercise-art:focus-visible,.sk-symbol-visual img:focus-visible{' +
        'outline:3px solid #6FA84A;outline-offset:4px}' +
      '@media(prefers-reduced-motion:reduce){#sk-aviso{transition:none}}';
    document.head.appendChild(st);
  }

  /* ---------- 10. ARRANQUE ---------- */
  function iniciar() {
    [inyectarEstilos, initProgreso, initParallax, initCascada, initPaleta,
     initSimbolos, initSello, initEjercicio, initVolver].forEach(run);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();