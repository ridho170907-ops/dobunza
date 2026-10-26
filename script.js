/* =====================================================
   DOBUNZA V2.0
   PREMIUM WEBSITE SCRIPT
===================================================== */



// =====================================================
// LOADING SCREEN
// =====================================================


window.addEventListener("load", () => {


    const loading = document.querySelector(".loading-screen");


    setTimeout(() => {


        loading.style.opacity = "0";


        loading.style.visibility = "hidden";


    }, 1500);


});






// =====================================================
// NAVBAR EFFECT ON SCROLL
// =====================================================


const header = document.querySelector("header");


window.addEventListener("scroll", () => {


    if(window.scrollY > 50){


        header.classList.add("scrolled");


    }else{


        header.classList.remove("scrolled");


    }


});







// =====================================================
// SCROLL REVEAL ANIMATION
// =====================================================


const revealElements = document.querySelectorAll(

    ".section-title, .hero-content, .hero-image"

);



const revealObserver = new IntersectionObserver(

(entries)=>{


    entries.forEach(entry=>{


        if(entry.isIntersecting){


            entry.target.classList.add("show");


        }


    });


},


{

    threshold:0.15

}



);



revealElements.forEach(element=>{


    element.classList.add("hidden");


    revealObserver.observe(element);


});







// =====================================================
// ADD CLASS FOR NAVBAR STYLE
// =====================================================


const style = document.createElement("style");


style.innerHTML = `



header.scrolled .navbar {


    background:

    rgba(255,255,255,0.75);



    box-shadow:

    0 20px 50px

    rgba(120,70,90,.15);


}



.hidden {


    opacity:0;


    transform:

    translateY(40px);


    transition:

    all 1s ease;


}



.show {


    opacity:1;


    transform:

    translateY(0);


}



`;



document.head.appendChild(style);







// =====================================================
// HERO BUTTON SMOOTH ACTION
// =====================================================


const journeyButton = document.querySelector(".hero-button");



if(journeyButton){


    journeyButton.addEventListener("click",(e)=>{


        e.preventDefault();



        document.querySelector("#story")

        .scrollIntoView({

            behavior:"smooth"

        });



    });


}







// =====================================================


const music = document.querySelector("#background-music");



let musicStarted = false;



document.addEventListener(

"click",

()=>{


    if(!musicStarted && music){


        music.volume = 0.3;


        music.play()

        .catch(()=>{});


        musicStarted = true;


    }


}



);







// =====================================================
// IMAGE PARALLAX EFFECT
// =====================================================


const heroImage = document.querySelector(".hero-image");



window.addEventListener("mousemove",(e)=>{


    if(!heroImage)return;



    const x = 

    (window.innerWidth / 2 - e.clientX) / 80;



    const y =

    (window.innerHeight / 2 - e.clientY) / 80;



    heroImage.style.transform =

    `translate(${x}px,${y}px)`;


});
// =====================================================
// FLOATING MUSIC BUTTON
// =====================================================
const musicButton = document.querySelector("#music-button");
const playIcon = document.querySelector("#music-button .play-icon");
const musicIcon = document.querySelector(".music-icon");
const audio = document.querySelector("#background-music");
if (musicButton && audio) {
    audio.volume = 0.3;
    musicButton.addEventListener("click", async () => {
        if (audio.paused) {
            try {
                await audio.play();
                if (playIcon) playIcon.textContent = "❚❚";
                musicButton.setAttribute("aria-label", "Jeda musik");
                musicButton.setAttribute("aria-pressed", "true");
                if (musicIcon) musicIcon.classList.add("active");
            } catch (error) {
                musicButton.setAttribute("aria-label", "Putar musik");
            }
        } else {
            audio.pause();
            if (playIcon) playIcon.textContent = "▶";
            musicButton.setAttribute("aria-label", "Putar musik");
            musicButton.setAttribute("aria-pressed", "false");
            if (musicIcon) musicIcon.classList.remove("active");
        }
    });
    audio.addEventListener("ended", () => {
        if (playIcon) playIcon.textContent = "▶";
        musicButton.setAttribute("aria-label", "Putar musik");
        musicButton.setAttribute("aria-pressed", "false");
        if (musicIcon) musicIcon.classList.remove("active");
    });
}

// =====================================================
// CURSOR GLOW
// =====================================================


const cursorGlow = document.querySelector(".cursor-glow");


document.addEventListener("mousemove",(e)=>{


    if(cursorGlow){


        cursorGlow.style.left = e.clientX+"px";


        cursorGlow.style.top = e.clientY+"px";


    }


});

// =====================================================
// LIVE RELATIONSHIP COUNTER + NEXT ANNIVERSARY
// Start date: 01 December 2023
// =====================================================
(() => {
    const $ = (id) => document.getElementById(id);
    function getStartDate() {
        const saved = localStorage.getItem("dobunzaRelationshipStartDate");
        if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) {
            const parts = saved.split("-").map(Number);
            const date = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0);
            if (!Number.isNaN(date.getTime())) return date;
        }
        return new Date(2023, 11, 1, 0, 0, 0);
    }
    const pad2 = (number) => String(number).padStart(2, "0");

    function updateLoveCounter() {
        const now = new Date();
        const startDate = getStartDate();
        if (now < startDate) {
            ["love-months", "love-days", "love-hours", "love-minutes", "love-seconds"].forEach(id => { if ($(id)) $(id).textContent = "0"; });
            return;
        }

        // Calendar-accurate elapsed time: full months first, then remaining days/time.
        let months = (now.getFullYear() - startDate.getFullYear()) * 12
                   + (now.getMonth() - startDate.getMonth());
        let monthAnchor = new Date(startDate.getFullYear(), startDate.getMonth() + months, startDate.getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
        if (monthAnchor > now) {
            months -= 1;
            monthAnchor = new Date(startDate.getFullYear(), startDate.getMonth() + months, startDate.getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
        }
        const remainingSeconds = Math.max(0, Math.floor((now.getTime() - monthAnchor.getTime()) / 1000));
        const days = Math.floor(remainingSeconds / 86400);
        const hours = Math.floor((remainingSeconds % 86400) / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;

        if ($("love-months")) $("love-months").textContent = months.toLocaleString("en-US");
        if ($("love-days")) $("love-days").textContent = days.toLocaleString("en-US");
        if ($("love-hours")) $("love-hours").textContent = pad2(hours);
        if ($("love-minutes")) $("love-minutes").textContent = pad2(minutes);
        if ($("love-seconds")) $("love-seconds").textContent = pad2(seconds);

        let nextAnniversary = new Date(now.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
        if (now >= nextAnniversary) {
            nextAnniversary = new Date(now.getFullYear() + 1, startDate.getMonth(), startDate.getDate(), 0, 0, 0);
        }
        const dateLabel = nextAnniversary.toLocaleDateString("en-US", {
            month: "long", day: "numeric", year: "numeric"
        });
        const daysLeft = Math.max(0, Math.ceil((nextAnniversary.getTime() - now.getTime()) / 86400000));
        if ($("next-anniversary-date")) $("next-anniversary-date").textContent = dateLabel;
        if ($("anniversary-days-left")) $("anniversary-days-left").textContent = daysLeft;
    }

    updateLoveCounter();
    window.setInterval(updateLoveCounter, 1000);
})();


// Theme toggle: remembers the selected theme on this device.
(() => {
  const root = document.documentElement;
  const button = document.getElementById('theme-toggle');
  if (!button) return;
  const icon = button.querySelector('.theme-toggle-icon');
  const applyTheme = (dark) => {
    if (dark) root.dataset.theme = 'dark';
    else delete root.dataset.theme;
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', dark ? 'Aktifkan mode terang' : 'Aktifkan mode malam');
    button.title = dark ? 'Mode malam aktif — klik untuk mode terang' : 'Klik untuk mode malam';
    if (icon) icon.textContent = dark ? '☀' : '☾';
  };
  let dark = false;
  try { dark = localStorage.getItem('dobunza-theme') === 'dark'; } catch (e) {}
  applyTheme(dark);
  button.addEventListener('click', () => {
    dark = root.dataset.theme !== 'dark';
    applyTheme(dark);
    try { localStorage.setItem('dobunza-theme', dark ? 'dark' : 'light'); } catch (e) {}
  });
})();
