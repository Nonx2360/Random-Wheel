let items = [];
let spinning = false;
let currentRotation = 0;
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');

// Configure toastr
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};

// Admin settings with defaults
let adminSettings = {
    minSpinTime: 3,
    maxSpinTime: 6,
    maxItems: 12,
    rulesMessage: "Default rules:\n1. Add items to the wheel\n2. Click spin to randomly select an item\n3. Maximum items allowed: 12"
};

// Load admin settings from localStorage
function loadAdminSettings() {
    const savedSettings = localStorage.getItem('wheelAdminSettings');
    if (savedSettings) {
        adminSettings = {...adminSettings, ...JSON.parse(savedSettings) };
    }
}

loadAdminSettings();

// Show Rules Modal
function showRules() {
    const modal = document.getElementById('rules-modal');
    const rulesContent = document.getElementById('rules-content');
    rulesContent.textContent = adminSettings.rulesMessage;
    modal.style.display = "block";
}

// Close Rules Modal
document.querySelector('.close-modal').onclick = function() {
    document.getElementById('rules-modal').style.display = "none";
}

document.getElementById('show-rules').onclick = showRules;

// Admin Panel Functions
function showAdminPanel() {
    const panel = document.getElementById('admin-panel');
    panel.style.display = 'block';

    // Load current settings into inputs
    document.getElementById('min-spin-time').value = adminSettings.minSpinTime;
    document.getElementById('max-spin-time').value = adminSettings.maxSpinTime;
    document.getElementById('max-items').value = adminSettings.maxItems;
    document.getElementById('rules-message').value = adminSettings.rulesMessage;
}

document.getElementById('save-admin').addEventListener('click', () => {
    adminSettings.minSpinTime = Number(document.getElementById('min-spin-time').value);
    adminSettings.maxSpinTime = Number(document.getElementById('max-spin-time').value);
    adminSettings.maxItems = Number(document.getElementById('max-items').value);
    adminSettings.rulesMessage = document.getElementById('rules-message').value;
    localStorage.setItem('wheelAdminSettings', JSON.stringify(adminSettings));
    document.getElementById('admin-panel').style.display = 'none';
});

document.getElementById('close-admin').addEventListener('click', () => {
    document.getElementById('admin-panel').style.display = 'none';
});

// Wheel Functions
function drawWheel(rotation = 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (items.length === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    const sliceAngle = (2 * Math.PI) / items.length;

    for (let i = 0; i < items.length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, i * sliceAngle, (i + 1) * sliceAngle);
        ctx.closePath();

        ctx.fillStyle = `hsl(${(360 / items.length) * i}, 70%, 70%)`;
        ctx.fill();
        ctx.stroke();

        // Add text
        ctx.save();
        ctx.rotate(i * sliceAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "black";
        ctx.fillText(items[i], radius - 10, 5);
        ctx.restore();
    }

    ctx.restore();
}

function spin() {
    if (spinning || items.length === 0) return;

    spinning = true;
    const spinTime = (Math.random() * (adminSettings.maxSpinTime - adminSettings.minSpinTime) + adminSettings.minSpinTime) * 1000;
    const totalRotation = Math.random() * 10 + 5; // 5-15 full rotations
    const startTime = Date.now();

    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / spinTime;

        if (progress >= 1) {
            spinning = false;
            return;
        }

        // Easing function for smoother deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        currentRotation = (totalRotation * Math.PI * 2 * easeOut);

        drawWheel(currentRotation);
        requestAnimationFrame(animate);
    }

    animate();

    // Show winner notification
    setTimeout(() => {
        const winner = items[Math.floor(Math.random() * items.length)];
        toastr.success(`The winner is: ${winner}!`, 'Wheel Result');
    }, spinTime);
}

// Event Listeners
document.getElementById('spin-btn').addEventListener('click', spin);
document.querySelector('.admin-trigger').addEventListener('click', showAdminPanel);

// Add item functionality
document.getElementById('add-btn').addEventListener('click', () => {
    const input = document.getElementById('item-input');
    const item = input.value.trim();

    if (item !== '' && items.length < adminSettings.maxItems) {
        items.push(item);
        input.value = '';
        drawWheel(currentRotation);

        // Update items display
        const itemsList = document.getElementById('items-display');
        itemsList.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    }
});

document.getElementById('clear-btn').addEventListener('click', () => {
    items = [];
    drawWheel();
    document.getElementById('items-display').innerHTML = '';
});

// Initial draw
drawWheel();