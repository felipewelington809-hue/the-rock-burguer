/* THE ROKZ BURGER | script.js */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');

  /* Ano no rodape */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* Header ganha fundo ao rolar */
  function onScroll() {
    header.classList.toggle('solid', window.scrollY > 40);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Menu mobile */
  function setMenu(open) {
    menu.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  burger.addEventListener('click', function () {
    setMenu(!menu.classList.contains('open'));
  });
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* Revelar elementos ao rolar */
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Imagem ainda nao adicionada: esconde o icone quebrado e mantem o bloco */
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () { img.classList.add('broken'); });
  });

  /* Galeria: carrossel */
  var box = document.querySelector('.lightbox');
  var boxImg = box.querySelector('img');
  box.addEventListener('click', function () { box.close(); });

  var track = document.querySelector('.track');
  if (track) {
    var slides = Array.prototype.slice.call(track.querySelectorAll('.slide'));
    var cur = document.querySelector('.g-count b');
    var bar = document.querySelector('.g-bar i');
    var prev = document.querySelector('.g-prev');
    var next = document.querySelector('.g-next');
    var idx = 0, ticking = false, moved = false;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    /* Espaco nas pontas para a primeira e a ultima foto poderem ficar no centro */
    function edges() {
      var w = track.clientWidth;
      var f = slides[0].offsetWidth;
      var l = slides[slides.length - 1].offsetWidth;
      track.style.paddingLeft = Math.max(0, (w - f) / 2) + 'px';
      track.style.paddingRight = Math.max(0, (w - l) / 2) + 'px';
    }

    function update() {
      ticking = false;
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, dist = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      idx = best;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); });
      cur.textContent = pad2(idx + 1);
      bar.style.width = ((idx + 1) / slides.length * 100) + '%';
      prev.disabled = idx === 0;
      next.disabled = idx === slides.length - 1;
    }

    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[i];
      track.scrollTo({
        left: s.offsetLeft + s.offsetWidth / 2 - track.clientWidth / 2,
        behavior: reduce ? 'auto' : 'smooth'
      });
    }

    track.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    prev.addEventListener('click', function () { goTo(idx - 1); });
    next.addEventListener('click', function () { goTo(idx + 1); });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(idx + 1); }
    });

    /* Arrastar com o mouse no computador (no celular o proprio dedo ja rola) */
    var down = false, sx = 0, sl = 0;
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; track.classList.add('dragging'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) { track.classList.remove('dragging'); goTo(idx); }
    });

    /* Clique: foto do centro abre em tela cheia, foto lateral vai para o centro */
    slides.forEach(function (s, i) {
      s.addEventListener('click', function () {
        if (moved) return;
        if (i !== idx) { goTo(i); return; }
        var img = s.querySelector('img');
        boxImg.src = img.currentSrc || img.src;
        boxImg.alt = img.alt;
        if (typeof box.showModal === 'function') box.showModal();
      });
      var im = s.querySelector('img');
      im.addEventListener('load', function () { edges(); update(); });
    });

    window.addEventListener('resize', function () { edges(); goTo(idx); update(); });
    window.addEventListener('load', function () { edges(); goTo(idx); update(); });
    edges();
    update();
  }
})();