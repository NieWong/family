const messages = [
    "Are you sure?",
    "Really sure??",
    "Are you positive?",
    "Pookie please...",
    "Just think about it!",
    "If you say no, I will be really sad...",
    "I will be very sad...",
    "I will be very very very sad...",
    "Ok fine, I will stop asking...",
    "Just kidding, say yes please! ❤️"
];

let messageIndex = 0;

function handleNoClick() {
    const noButton = document.querySelector('.no-button');
    const yesButton = document.querySelector('.yes-button');
    if (!noButton || !yesButton) return;

    noButton.textContent = messages[messageIndex];
    messageIndex = (messageIndex + 1) % messages.length;

    const container = document.querySelector('.container');
    const rect = container?.getBoundingClientRect();
    const maxX = (rect?.width || window.innerWidth) - noButton.offsetWidth;
    const maxY = (rect?.height || window.innerHeight) - noButton.offsetHeight;
    const nextLeft = Math.max(0, Math.min(maxX, Math.random() * maxX));
    const nextTop = Math.max(0, Math.min(maxY, Math.random() * maxY));
    noButton.style.position = 'relative';
    noButton.style.left = `${nextLeft - (noButton.offsetLeft)}px`;
    noButton.style.top = `${nextTop - (noButton.offsetTop)}px`;

    const currentSize = parseFloat(window.getComputedStyle(yesButton).fontSize);
    yesButton.style.fontSize = `${Math.min(currentSize * 1.25, 64)}px`;
}

function handleYesClick() {
    const acceptedAt = Date.now();
    try { localStorage.setItem('valentineAcceptedAt', String(acceptedAt)); } catch (_) {}

    try {
        const payload = JSON.stringify({ acceptedAt, userAgent: navigator.userAgent });
        const isHttp = location.protocol === 'http:' || location.protocol === 'https:';
        const endpoint = isHttp ? `${location.origin}/api/send-yes` : 'http://localhost:3000/send-yes';
        navigator.sendBeacon?.(endpoint, new Blob([payload], { type: 'application/json' }));
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true
        }).catch(() => {});
    } catch (_) {}

    window.location.href = "yes_page.html";
}

function spawnHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = 2.8 + Math.random() * 2 + 's';
    heart.style.background = `hsl(${330 + Math.random()*30}, 85%, ${60 + Math.random()*20}%)`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 5000);
}
setInterval(spawnHeart, 900);

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'y') handleYesClick();
});