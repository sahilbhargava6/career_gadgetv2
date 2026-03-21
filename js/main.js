  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 60); });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('on'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── Testimonial Carousel ────────────────────────────────────────────────────
  (function() {
    const carousel = document.getElementById('testiCarousel');
    if (!carousel) return;
    const dots = document.querySelectorAll('#testiDots .testi-dot');
    const cards = carousel.querySelectorAll('.tcard');
    let pos = 0, autoTimer;

    function visibleCount() {
      if (window.innerWidth < 600) return 1;
      if (window.innerWidth < 960) return 2;
      return 3;
    }
    function maxPos() { return Math.max(0, cards.length - visibleCount()); }

    function update() {
      const cw = carousel.querySelector('.tcard').offsetWidth + 20;
      carousel.style.transform = 'translateX(-' + (pos * cw) + 'px)';
      dots.forEach((d, i) => d.classList.toggle('active', i === pos));
    }

    function next() { pos = pos >= maxPos() ? 0 : pos + 1; update(); }
    function prev() { pos = pos <= 0 ? maxPos() : pos - 1; update(); }

    document.getElementById('testiNext').addEventListener('click', function() { clearInterval(autoTimer); next(); autoTimer = setInterval(next, 4500); });
    document.getElementById('testiPrev').addEventListener('click', function() { clearInterval(autoTimer); prev(); autoTimer = setInterval(next, 4500); });
    dots.forEach(function(d) {
      d.addEventListener('click', function() {
        clearInterval(autoTimer);
        pos = Math.min(parseInt(d.dataset.slide), maxPos());
        update();
        autoTimer = setInterval(next, 4500);
      });
    });

    autoTimer = setInterval(next, 4500);
    window.addEventListener('resize', update);
    update();
  })();
