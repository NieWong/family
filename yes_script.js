function spawnHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '100vh';
    heart.style.zIndex = '1';
    heart.style.pointerEvents = 'none';
    heart.style.animationDuration = 2.6 + Math.random() * 2 + 's';
    heart.style.background = `hsl(${330 + Math.random()*30}, 85%, ${60 + Math.random()*20}%)`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
}

function burstHearts(count = 36) {
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart';
        const size = 12 + Math.random() * 12;
        heart.style.width = size + 'px';
        heart.style.height = size + 'px';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.top = '85vh';
        heart.style.zIndex = '1';
        heart.style.pointerEvents = 'none';
        heart.style.animationDuration = 2.2 + Math.random() * 1.8 + 's';
        heart.style.background = `hsl(${330 + Math.random()*30}, 85%, ${60 + Math.random()*20}%)`;
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 5000);
    }
}

let heartTimer = setInterval(spawnHeart, 800);

document.getElementById('replayBtn')?.addEventListener('click', () => {
    clearInterval(heartTimer);
    burstHearts(42);
    heartTimer = setInterval(spawnHeart, 800);
});


try {
    const acceptedAt = localStorage.getItem('valentineAcceptedAt');
    if (acceptedAt) {
        const note = document.createElement('p');
        note.style.marginTop = '6px';
        note.style.color = '#a33';
        note.textContent = 'P.S. This wasn\'t a coincidence — it was meant to be.';
        document.querySelector('.container')?.appendChild(note);
    }
} catch (_) {}


