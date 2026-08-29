document.addEventListener('DOMContentLoaded', function () { 
    const headline = document.getElementById('headline'); 
    const text = headline.innerText; 
    headline.innerText = ''; 
    text.split('').forEach((char, index) => { 
        const span = document.createElement('span'); 
        span.classList.add('fade-in'); span.style.transitionDelay = `${index * 0.1}s`; 
        span.innerText = char; headline.appendChild(span); 
        setTimeout(() => { 
            span.classList.add('visible'); 
        }, 50); 
    });
 });


 document.addEventListener('DOMContentLoaded', function () { 
    const subline = document.getElementById('subline'); 
    const text1 = subline.innerText; 
    subline.innerText = ''; 
    text1.split('').forEach((char, index) => { 
        const span = document.createElement('span'); 
        span.classList.add('fade-in'); span.style.transitionDelay = `${index * 0.1}s`; 
        span.innerText = char; subline.appendChild(span); 
        setTimeout(() => { 
            span.classList.add('visible'); 
        }, 50); 
    });
 });

