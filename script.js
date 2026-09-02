(function(){
  "use strict";

  var menuToggle = document.getElementById('menuToggle');
  var mainNav = document.getElementById('mainNav');
  if(menuToggle && mainNav){
    menuToggle.addEventListener('click', function(){
      var open = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open ? 'true':'false');
    });
    mainNav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ mainNav.classList.remove('open'); });
    });
  }

  var currentPage = document.body.getAttribute('data-page');
  if(currentPage){
    document.querySelectorAll('a[data-page]').forEach(function(a){
      if(a.getAttribute('data-page') === currentPage){ a.classList.add('current'); }
    });
  }

  var langButtons = document.querySelectorAll('.lang-toggle button');
  function applyLang(lang){
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-tr][data-en]').forEach(function(el){
      var val = lang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-tr');
      el.innerHTML = val;
    });
    langButtons.forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-lang') === lang); });
    try{ localStorage.setItem('eh_lang', lang); }catch(e){}
  }
  langButtons.forEach(function(btn){
    btn.addEventListener('click', function(){ applyLang(btn.getAttribute('data-lang')); });
  });
  var savedLang = 'tr';
  try{ savedLang = localStorage.getItem('eh_lang') || 'tr'; }catch(e){}
  applyLang(savedLang);

  var tabs = document.querySelectorAll('.bio-tab');
  var panels = document.querySelectorAll('.timeline');
  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      panels.forEach(function(p){ p.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelector('.timeline[data-panel="'+tab.getAttribute('data-tab')+'"]').classList.add('active');
    });
  });

  var filterButtons = document.querySelectorAll('.filter-btn');
  var pubCards = document.querySelectorAll('#pubGrid .pub-card');
  filterButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterButtons.forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      var f = btn.getAttribute('data-filter');
      pubCards.forEach(function(card){
        card.style.display = (f === 'all' || card.getAttribute('data-cat') === f) ? '' : 'none';
      });
    });
  });

  var form = document.getElementById('contactForm');
  if(form){
    var statusEl = document.getElementById('formStatus');
    var submitBtn = form.querySelector('button[type="submit"]');
    function setStatus(kind, trText, enText){
      if(!statusEl) return;
      statusEl.className = 'form-status ' + (kind || '');
      var lang = document.documentElement.lang === 'en' ? 'en' : 'tr';
      statusEl.textContent = lang === 'en' ? enText : trText;
    }
    form.addEventListener('submit', function(e){
      e.preventDefault();

      var honeypot = form.querySelector('input[name="botcheck"]');
      if(honeypot && honeypot.checked){
        form.reset();
        return;
      }

      var accessKey = form.querySelector('input[name="access_key"]').value;
      if(!accessKey || accessKey.indexOf('YOUR_') === 0){
        setStatus('err', 'Form henüz bağlanmadı: Web3Forms erişim anahtarı eklenmeli.', 'Form is not connected yet: a Web3Forms access key is required.');
        return;
      }

      var formData = new FormData(form);
      var payload = Object.fromEntries(formData.entries());

      if(submitBtn){ submitBtn.disabled = true; }
      setStatus('', 'Gönderiliyor…', 'Sending…');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function(res){ return res.json(); })
        .then(function(result){
          if(result && result.success){
            setStatus('ok', 'Mesajınız iletildi, teşekkürler.', 'Your message has been sent, thank you.');
            form.reset();
          } else {
            setStatus('err', 'Mesaj gönderilemedi, lütfen tekrar deneyin.', 'The message could not be sent, please try again.');
          }
        })
        .catch(function(){
          setStatus('err', 'Bir bağlantı hatası oluştu, lütfen tekrar deneyin.', 'A connection error occurred, please try again.');
        })
        .finally(function(){
          if(submitBtn){ submitBtn.disabled = false; }
        });
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, {threshold:0.12});
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

})();
