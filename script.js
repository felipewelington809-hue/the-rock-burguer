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

  /* Galeria: foto grande + miniaturas */
  var box = document.querySelector('.lightbox');
  var boxImg = box.querySelector('img');
  var show = document.querySelector('.showcase');
  if (show) {
    var stage = show.querySelector('.stage');
    var big = stage.querySelector('img');
    var thumbs = Array.prototype.slice.call(show.querySelectorAll('.thumb'));
    var counter = show.querySelector('.counter');
    var idx = 0;

    function go(i) {
      idx = (i + thumbs.length) % thumbs.length;
      var t = thumbs[idx];
      var src = t.getAttribute('data-full');
      var alt = t.querySelector('img').alt;
      thumbs.forEach(function (b, k) { b.classList.toggle('on', k === idx); });
      counter.textContent = (idx + 1) + ' / ' + thumbs.length;
      big.classList.add('fade');
      var pre = new Image();
      pre.onload = pre.onerror = function () {
        big.src = src;
        big.alt = alt;
        big.classList.remove('broken', 'fade');
        stage.style.setProperty('--bg', 'url("' + src + '")');
      };
      pre.src = src;
    }
    go(0);

    thumbs.forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });
    show.querySelector('.prev').addEventListener('click', function () { go(idx - 1); });
    show.querySelector('.next').addEventListener('click', function () { go(idx + 1); });
    show.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(idx - 1);
      if (e.key === 'ArrowRight') go(idx + 1);
    });

    /* Arrastar no celular */
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    /* Tela cheia ao clicar na foto */
    big.addEventListener('click', function () {
      boxImg.src = big.src;
      boxImg.alt = big.alt;
      if (typeof box.showModal === 'function') box.showModal();
    });
  }
  box.addEventListener('click', function () { box.close(); });
})();