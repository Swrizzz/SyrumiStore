// --- DATABASE LAYANAN & HARGA ---
const database = {
    game: [
        { id: 'ml', name: 'Mobile Legends', icon: 'images/icon-mlbb.png', label: 'USER ID (ZONE ID)' },
        { id: 'ff', name: 'Free Fire', icon: 'images/icon-ff.png', label: 'PLAYER ID (UID)' }
    ],
    sosmed: [
        { id: 'tk_like', name: 'TikTok Likes', icon: 'images/icon-tiktok.png', label: 'LINK VIDEO TIKTOK' },
        { id: 'ig_fol', name: 'IG Followers', icon: 'images/icon-ig.png', label: 'LINK PROFIL / USERNAME' }
    ],
    ppob: [
        { id: 'pulsa', name: 'Pulsa Reguler', icon: 'images/icon-ppob.png', label: 'NOMOR HP' }
    ]
};

const pricelist = {
    ml: [
        { item: '3 Diamonds', harga: 'Rp1.200', image: 'images/diamond.png', tersedia: true },
        { item: '12 Diamonds', harga: 'Rp3.500', image: 'images/diamond.png', tersedia: false }, // Contoh Stok Kosong
        { item: 'Weekly Pass', harga: 'Rp28.000', image: 'images/wmp.png', tersedia: true }
    ],
    tk_like: [
        { item: '100 Likes', harga: 'Rp1.000', image: 'images/heart.png', tersedia: true },
        { item: '500 Likes', harga: 'Rp4.500', image: 'images/heart.png', tersedia: true }
    ]
    // Tambahkan id lainnya di sini sesuai database di atas...
};

// --- STATE MANAGEMENT ---
let currentCategory = "";
let selectedProduct = "";
let selectedPrice = "";
let currentID = "";

// --- FUNGSI NAVIGASI (KAMAR) ---
function openKategori(cat) {
    currentCategory = cat;
    const listDiv = document.getElementById('list-layanan');
    const title = document.getElementById('kategori-title');
    
    title.innerText = "Pilih " + (cat === 'game' ? 'Game' : cat === 'sosmed' ? 'Sosmed' : 'Layanan');
    listDiv.innerHTML = "";

    database[cat].forEach(item => {
        listDiv.innerHTML += `
            <div onclick="openOrder('${item.id}', '${item.name}', '${item.label}')" class="glass menu-item">
                <img src="${item.icon}" onerror="this.src='https://via.placeholder.com/40'">
                <span>${item.name}</span>
            </div>
        `;
    });

    switchScreen('screen-kategori');
}

function openOrder(id, name, label) {
    currentID = id;
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = label;
    document.getElementById('user-id').value = ""; // Reset input
    
    // Fitur Mockup Cek Username (Hanya contoh ML)
    if(id === 'ml') {
        document.getElementById('container-cek-id').classList.remove('hidden');
    } else {
        document.getElementById('container-cek-id').classList.add('hidden');
    }

    renderProducts(id);
    switchScreen('screen-order');
}

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    selectedProduct = ""; // Reset pilihan

    if (!pricelist[id]) {
        grid.innerHTML = "<p style='grid-column: span 2; text-align:center; font-size:12px; color:red;'>Produk belum tersedia.</p>";
        return;
    }

    pricelist[id].forEach(p => {
        const isStok = p.tersedia;
        grid.innerHTML += `
            <div onclick="${isStok ? `selectItem('${p.item}', '${p.harga}', this)` : ''}" 
                 class="glass product-card ${!isStok ? 'stok-kosong' : ''}">
                <img src="${p.image}" onerror="this.src='https://via.placeholder.com/35'">
                <span class="item-name">${p.item}</span>
                <span class="item-price">${isStok ? p.harga : 'GANGGUAN'}</span>
            </div>
        `;
    });
}

function selectItem(item, harga, element) {
    selectedProduct = item;
    selectedPrice = harga;
    
    document.querySelectorAll('.product-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
}

// --- FUNGSI SISTEM ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
}

function goToLobby() { switchScreen('screen-lobby'); }
function backToKategori() { switchScreen('screen-kategori'); }

function kirimKeWA() {
    const userInput = document.getElementById('user-id').value;
    const gameName = document.getElementById('order-title').innerText;

    if (!userInput) return alert("Isi Data Link/ID dulu ya Kak! ✨");
    if (!selectedProduct) return alert("Pilih produknya dulu dong! 💖");

    const nomorWA = "6289507913948";
    const pesan = window.encodeURIComponent(
        `*ORDER SYRUMISTORE*\n` +
        `--------------------------\n` +
        `Produk: ${gameName}\n` +
        `Target: ${userInput}\n` +
        `Item: ${selectedProduct}\n` +
        `Harga: ${selectedPrice}\n` +
        `--------------------------\n` +
        `Mohon instruksi bayarnya min! ✨`
    );

    window.location.href = `https://wa.me/${nomorWA}?text=${pesan}`;
}

// Tambahkan CSS dinamis untuk stok kosong
const style = document.createElement('style');
style.innerHTML = `
    .stok-kosong { opacity: 0.5; filter: grayscale(1); cursor: not-allowed !important; }
    .hidden { display: none; }
`;
document.head.appendChild(style);
