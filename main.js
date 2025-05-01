// Sistema di gestione della lingua per il sito Closyer
document.addEventListener('DOMContentLoaded', function() {
    // Debug flag - impostalo su true per forzare la visualizzazione dei log anche in produzione
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log(...args);
        }
    }
    
    // Funzione per ottenere la lingua predefinita del browser
    function getBrowserLanguage() {
        const language = navigator.language || navigator.userLanguage;
        debugLog("Lingua del browser:", language);
        // Prendiamo solo i primi due caratteri (codice lingua)
        const browserLang = language.substring(0, 2).toLowerCase();
        
        // Verifichiamo se la lingua del browser è supportata
        if (translations[browserLang]) {
            return browserLang;
        }
        
        // Se la lingua non è supportata, restituiamo la lingua predefinita
        return 'it'; // Italiano come fallback
    }
    
    // Funzione per applicare le traduzioni in base alla lingua selezionata
    function applyTranslations(lang) {
        debugLog("Applicazione traduzioni per lingua:", lang);
        
        // Verifichiamo se la lingua richiesta esiste
        if (!translations[lang]) {
            debugLog("Lingua non supportata, uso 'it' come fallback");
            lang = 'it'; // Fallback alla lingua italiana
        }
        
        // Aggiorna l'attributo lang dell'HTML
        document.documentElement.lang = lang;
        
        // Seleziona tutti gli elementi con attributo data-i18n
        const elements = document.querySelectorAll('[data-i18n]');
        
        // Per ogni elemento, applica la traduzione corrispondente
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            
            if (translations[lang][key]) {
                // Se l'elemento è un input, aggiorna il placeholder
                if (element.tagName === 'INPUT') {
                    element.placeholder = translations[lang][key];
                } 
                // Se è un elemento con HTML interno (come per il copyright che ha entity HTML)
                else if (key === 'copyright') {
                    element.innerHTML = translations[lang][key];
                }
                // Per gli altri casi, aggiorna il testo
                else {
                    element.textContent = translations[lang][key];
                }
            } else {
                debugLog(`Chiave di traduzione non trovata: ${key}`);
            }
        });
        
        // Salva la preferenza di lingua
        localStorage.setItem('language_preference', lang);
        
        // Aggiorna la classe attiva sui pulsanti della lingua
        document.querySelectorAll('.language-switch, .lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Gestione della lingua per determinare la lingua iniziale
    function detectUserLanguage() {
        // Controlliamo prima la preferenza salvata
        const savedLanguage = localStorage.getItem('language_preference');
        
        if (savedLanguage) {
            debugLog("Usando la lingua salvata:", savedLanguage);
            applyTranslations(savedLanguage);
            return;
        }
        
        // Poi controlliamo la lingua del browser
        const browserLang = getBrowserLanguage();
        debugLog("Lingua del browser rilevata:", browserLang);
        
        if (translations[browserLang]) {
            debugLog("Lingua del browser supportata, la utilizzo");
            applyTranslations(browserLang);
            return;
        }
        
        // Solo se la lingua del browser non è supportata, proviamo a rilevare il paese tramite API
        debugLog("Lingua del browser non supportata o ambigua, controllo posizione");
        
        // Prima otteniamo l'indirizzo IP dell'utente usando ipify.org
        fetch('https://api.ipify.org?format=json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nel recupero dell\'IP: ' + response.status);
                }
                return response.json();
            })
            .then(ipData => {
                const userIP = ipData.ip;
                debugLog("IP rilevato:", userIP);
                
                // Ora utilizziamo ipwhois.io per ottenere informazioni geografiche basate sull'IP
                return fetch(`https://ipwho.is/${userIP}`);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nel recupero dei dati geografici: ' + response.status);
                }
                return response.json();
            })
            .then(geoData => {
                // Verifichiamo che la richiesta sia andata a buon fine
                if (!geoData.success) {
                    debugLog('Query fallita:', geoData.message);
                    throw new Error('Geo-localizzazione fallita');
                }
                
                // Log del paese rilevato per debug
                debugLog("RISPOSTA COMPLETA API:", geoData);
                debugLog("Paese rilevato:", geoData.country_code);
                
                // Elenco dei paesi in cui mostrare la versione italiana
                const italianCountries = ['IT', 'MT', 'CH', 'SM', 'VA'];
                const userLang = italianCountries.includes(geoData.country_code) ? 'it' : 'en';
                
                debugLog("Lingua selezionata in base alla posizione:", userLang);
                
                // Applica le traduzioni
                applyTranslations(userLang);
            })
            .catch(error => {
                // In caso di errore, usiamo la lingua predefinita come fallback
                console.error('Errore durante la geo-localizzazione:', error);
                
                debugLog("Uso italiano come lingua di fallback");
                applyTranslations('it');
            });
    }
    
    // Evento per gestire il cambio lingua tramite i pulsanti nel footer
    document.querySelectorAll('.language-switch, .lang-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            debugLog("Cambio lingua richiesto:", lang);
            applyTranslations(lang);
        });
    });
    
    // Rileva e imposta la lingua iniziale
    detectUserLanguage();
});

// Smooth scrolling per i link di ancoraggio
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Effetto scrolling per la barra di navigazione
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }
});

// Animazione fade-in per le card
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .discord-card').forEach(card => {
        observer.observe(card);
    });
});

// ====== NUOVE ANIMAZIONI AVANZATE ======

// Effetto sfocatura delle bolle al passaggio del mouse
document.addEventListener('DOMContentLoaded', function() {
    const bubbles = document.querySelectorAll('.bubble');
    
    bubbles.forEach(bubble => {
        bubble.addEventListener('mouseenter', function() {
            this.classList.add('bubble-blur');
        });
        
        bubble.addEventListener('mouseleave', function() {
            this.classList.remove('bubble-blur');
        });
    });
    
    // Effetto che rende le bolle responsive al movimento del mouse
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        heroSection.addEventListener('mousemove', function(e) {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            bubbles.forEach(bubble => {
                const rect = bubble.getBoundingClientRect();
                const bubbleX = rect.left + rect.width / 2;
                const bubbleY = rect.top + rect.height / 2;
                
                // Calcola la distanza tra mouse e bolla
                const deltaX = mouseX - bubbleX;
                const deltaY = mouseY - bubbleY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Se il mouse è abbastanza vicino, applica un leggero spostamento
                if (distance < 300) {
                    const moveX = deltaX * 0.05;
                    const moveY = deltaY * 0.05;
                    bubble.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
                } else {
                    bubble.style.transform = '';
                }
            });
        });
    }
});

// Effetto parallax per la hero section
document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const bubbles = document.querySelectorAll('.bubble');
    
    window.addEventListener('scroll', function() {
        const scrollPos = window.scrollY;
        
        // Effetto parallax al testo hero
        if (heroSection && heroContent) {
            // Il contenuto si muove più lentamente rispetto allo scroll
            heroContent.style.transform = `translateY(${scrollPos * 0.2}px)`;
        }
        
        // Le bolle si muovono a velocità differenti per creare profondità
        bubbles.forEach((bubble, index) => {
            const speed = (index + 1) * 0.03;
            bubble.style.transform = `translateY(${scrollPos * speed}px) rotate(${scrollPos * 0.01}deg)`;
        });
    });
});

// Effetto 3D tilt sui pulsanti
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.add-button, .big-button, .discord-card');
    
    buttons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // posizione x del mouse all'interno del bottone
            const y = e.clientY - rect.top;  // posizione y del mouse all'interno del bottone
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calcola la distanza dal centro
            const deltaX = (x - centerX) / centerX * 10; // max 10 gradi
            const deltaY = (y - centerY) / centerY * 7;  // max 7 gradi
            
            // Applica la trasformazione tilt + scale leggero
            this.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg) scale(1.02)`;
            
            // Aggiungi un effetto di luce che segue il mouse
            if (this.classList.contains('add-button') || this.classList.contains('big-button')) {
                const light = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)`;
                this.style.backgroundImage = `linear-gradient(45deg, var(--primary), var(--secondary)), ${light}`;
            }
        });
        
        button.addEventListener('mouseleave', function() {
            // Reimposta la trasformazione quando il mouse esce
            this.style.transform = '';
            
            // Reimposta il background per i pulsanti
            if (this.classList.contains('add-button') || this.classList.contains('big-button')) {
                this.style.backgroundImage = 'linear-gradient(45deg, var(--primary), var(--secondary))';
            }
        });
    });
});

// Effetto reveal all'entrata delle sezioni nella viewport
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.features, .add-section, .discord-section');
    
    const options = {
        threshold: 0.15,  // 15% della sezione deve essere visibile
        rootMargin: '0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Aggiungi classe per animare i titoli delle sezioni
                const title = entry.target.querySelector('.section-title');
                if (title) {
                    title.classList.add('animate-title');
                }
                
                // Una volta che la sezione è stata rivelata, non è più necessario osservarla
                observer.unobserve(entry.target);
            }
        });
    }, options);
    
    sections.forEach(section => {
        section.classList.add('section-hidden');
        sectionObserver.observe(section);
    });
});

// Animazione typing effect per la hero section - modificata per supportare i18n
document.addEventListener('DOMContentLoaded', function() {
    const heroTitle = document.querySelector('.hero h1');
    
    if (heroTitle) {
        // Aspettiamo che le traduzioni siano applicate prima di attivare l'effetto typing
        setTimeout(() => {
            // Salva il testo attuale (già tradotto)
            const originalText = heroTitle.textContent;
            // Svuota il titolo
            heroTitle.textContent = '';
            
            let charIndex = 0;
            
            // Funzione per animare il testo lettera per lettera
            function typeText() {
                if (charIndex < originalText.length) {
                    heroTitle.textContent += originalText.charAt(charIndex);
                    charIndex++;
                    setTimeout(typeText, 50); // velocità del typing
                } else {
                    // Aggiungi la classe di animazione shimmer quando il typing è completato
                    heroTitle.classList.add('title-shimmer');
                }
            }
            
            // Inizia l'animazione
            typeText();
        }, 800); // Attendi che le traduzioni siano applicate
    }
});

// Effetto di contagio per le card
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.feature-card');
    
    cards.forEach((card, index) => {
        card.addEventListener('mouseenter', function() {
            // Aggiungi classe per l'elemento corrente
            this.classList.add('active');
            
            // Influenza leggera sulle card adiacenti
            if (cards[index - 1]) cards[index - 1].classList.add('neighbor');
            if (cards[index + 1]) cards[index + 1].classList.add('neighbor');
        });
        
        card.addEventListener('mouseleave', function() {
            // Rimuovi tutte le classi dopo l'hover
            this.classList.remove('active');
            cards.forEach(c => c.classList.remove('neighbor'));
        });
    });
});
