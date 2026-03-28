  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => { nav.classList.toggle('scrolled', window.scrollY > 60); });
  
  // ── Mobile Menu Toggle ──────────────────────────────────────────────────────
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
  
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

  // ── Placed Carousel (Infinite Scroll) ───────────────────────────────────────
  (function() {
    const carousel = document.getElementById('placedCarousel');
    if (!carousel) return;
    const logos = carousel.querySelectorAll('.placed-logo');
    if (logos.length === 0) return;
    
    // Duplicate logos for seamless infinite scroll
    logos.forEach(logo => {
      carousel.appendChild(logo.cloneNode(true));
    });
  })();

  // ── Counter Animation on Scroll ─────────────────────────────────────────────
  (function() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    function animateCounter(el) {
      const target = parseFloat(el.dataset.counter || '0');
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = target * eased;
        const formatted = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString();
        el.textContent = formatted + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.35 });

    counters.forEach(counter => io.observe(counter));
  })();

  // ── Form Submission Handling ────────────────────────────────────────────────
  function handleFormSubmit(form, formData) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const actionUrl = form.action || 'https://script.google.com/macros/s/AKfycbyC_cWb6dkYxpGp07KyELLB2xjwKeNWUJoJKyQk-fVN8GKRvzJzL8hSZLlAzt3QwqCm/exec';

    // Clear any old messages
    const oldMessages = form.querySelectorAll('.form-message');
    oldMessages.forEach(msg => msg.remove());

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    const body = new URLSearchParams();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== undefined && formData[key] !== null) {
        body.append(key, formData[key]);
      }
    });

    fetch(actionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: body.toString(),
    })
      .then(response => response.text())
      .then(text => {
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          data = null;
        }

        let success = false;
        if (data && (data.success || data.status === 'success' || data.result === 'success')) {
          success = true;
        } else if (!data && text && !/error/i.test(text) && text.trim().length > 0) {
          success = true;
        }

        if (success) {
          submitBtn.textContent = '✓ Sent!';
          submitBtn.style.backgroundColor = '#10b981';
          form.reset();

          const successMsg = document.createElement('div');
          successMsg.className = 'form-message';
          successMsg.style.cssText = 'color: #10b981; font-weight: 500; margin-top: 10px; text-align: center;';
          successMsg.textContent = 'Thank you! Check your email for the calendar invite.';
          form.appendChild(successMsg);

          setTimeout(() => {
            successMsg.remove();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '';
          }, 5000);
        } else {
          throw new Error(text || 'Unknown server response');
        }
      })
      .catch(error => {
        console.error('Form submission error:', error);

        submitBtn.textContent = '❌ Error';
        submitBtn.style.backgroundColor = '#ef4444';

        const errorMsg = document.createElement('div');
        errorMsg.className = 'form-message';
        errorMsg.style.cssText = 'color: #ef4444; font-weight: 500; margin-top: 10px; text-align: center; font-size: 14px;';
        errorMsg.textContent = 'Sorry, there was an error. Please try again or contact us directly.';
        form.appendChild(errorMsg);

        setTimeout(() => {
          errorMsg.remove();
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          submitBtn.style.backgroundColor = '';
        }, 5000);
      });
  }

  // Handle contact form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        name: this.name.value,
        email: this.email.value,
        phone: this.phone.value,
        audience: this.audience.value,
        preferredDate: this.preferredDate ? this.preferredDate.value : '',
        preferredTime: this.preferredTime ? this.preferredTime.value : ''
      };
      
      handleFormSubmit(this, formData);
    });
  }

  // Handle CTA form (index.html)
  const ctaForm = document.querySelector('.cta-form-card form');
  if (ctaForm) {
    ctaForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        name: this.firstName.value + ' ' + this.lastName.value,
        email: this.email.value,
        phone: this.phone.value,
        audience: this.audience.value,
        preferredDate: this.preferredDate ? this.preferredDate.value : '',
        preferredTime: this.preferredTime ? this.preferredTime.value : ''
      };
      
      handleFormSubmit(this, formData);
    });
  }
