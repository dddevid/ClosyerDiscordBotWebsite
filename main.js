// Rilevamento del paese tramite ipify.org e ipwhois.io (senza token API)
document.addEventListener('DOMContentLoaded', function() {
    // Debug flag - impostalo su true per forzare la visualizzazione dei log anche in produzione
    const DEBUG = true;
    
    function debugLog(...args) {
        if (DEBUG) {
            console.log(...args);
        }
    }
    
    // Controlliamo prima se l'utente ha già impostato una preferenza linguistica
    const langPreference = localStorage.getItem('language_preference');
    debugLog("Preferenza lingua salvata:", langPreference);
    
    // Se l'utente ha già scelto una lingua, rispettiamo quella scelta
    if (langPreference === 'en' && !window.location.href.includes('indexen.html')) {
        debugLog("Reindirizzamento a versione inglese per preferenza utente");
        window.location.href = 'indexen.html';
        return;
    } else if (langPreference === 'it' && window.location.href.includes('indexen.html')) {
        debugLog("Reindirizzamento a versione italiana per preferenza utente");
        window.location.href = 'index.html';
        return;
    }
    
    // Se non abbiamo una preferenza di lingua salvata, controlliamo la posizione dell'utente
    if (!langPreference) {
        debugLog("Nessuna preferenza di lingua trovata, controllo posizione");
        
        // Controlliamo prima se siamo sulla versione corretta della pagina in base all'URL attuale
        const currentUrl = window.location.href;
        const isEnglishPage = currentUrl.includes('indexen.html');
        
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
                    return;
                }
                
                // Log del paese rilevato per debug
                debugLog("RISPOSTA COMPLETA API:", geoData);
                debugLog("Paese rilevato:", geoData.country_code);
                
                // Elenco dei paesi in cui mostrare la versione italiana
                const italianCountries = ['IT', 'MT', 'CH'];
                const shouldShowItalian = italianCountries.includes(geoData.country_code);
                
                debugLog("Dovrebbe mostrare italiano?", shouldShowItalian);
                
                // Memorizziamo la preferenza dell'utente
                localStorage.setItem('language_preference', shouldShowItalian ? 'it' : 'en');
                
                // Gestisce il reindirizzamento
                if (shouldShowItalian) {
                    // Utente dovrebbe vedere la versione italiana
                    if (isEnglishPage) {
                        debugLog("Reindirizzamento a versione italiana");
                        window.location.href = 'index.html';
                    }
                } else {
                    // Utente dovrebbe vedere la versione inglese
                    if (!isEnglishPage) {
                        debugLog("Reindirizzamento a versione inglese");
                        window.location.href = 'indexen.html';
                    }
                }
            })
            .catch(error => {
                // In caso di errore, non facciamo nessun reindirizzamento
                console.error('Errore durante il controllo dell\'IP:', error);
                // Come fallback, lasciamo la pagina corrente
            });
    }
});

// Funzione per cambiare manualmente la lingua
function changeLanguage(lang) {
    localStorage.setItem('language_preference', lang);
    if (lang === 'en' && !window.location.href.includes('indexen.html')) {
        window.location.href = 'indexen.html';
    } else if (lang === 'it' && window.location.href.includes('indexen.html')) {
        window.location.href = 'index.html';
    }
}

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

// Animazione typing effect per la hero section
document.addEventListener('DOMContentLoaded', function() {
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        // Salva il testo originale
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
        
        // Inizia l'animazione con un leggero ritardo
        setTimeout(typeText, 500);
    }
});

// Effetto di contagio per le card (quando ne passi sopra una influenza anche quelle adiacenti)
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
