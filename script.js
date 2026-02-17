let selectedProduct = "", selectedPrice = "", currentServiceId = "", requiredPattern = "";

// --- KONFIGURASI ADMIN ---
const ADMIN_A = "6289507913948"; 
const ADMIN_B = "6285924527083"; 
const isManualClose = false; 

function getCurrentAdmin() {
    const detik = new Date().getSeconds();
    return (detik % 2 === 0) ? 
    { nomor: ADMIN_A, label: "ADMIN A", noteBayar: "- DANA: 089507913948\n- QRIS: https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504" } : 
    { nomor: ADMIN_B, label: "ADMIN B", noteBayar: "- DANA: 085924527083\n- QRIS: Minta ke Admin" };
}

// UI Functions
function kustomAlert(title, message, icon = "⚠️") {
    document.getElementById('alert-icon').innerText = icon;
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerText = message;
    document.getElementById('alert-overlay').style.display = 'flex';
}
function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }
function bukaTesti() { document.getElementById('testi-overlay').style.display = 'flex'; }
function tutupTesti() { document.getElementById('testi-overlay').style.display = 'none'; }
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => { s.classList.remove('active'); s.style.display = 'none'; });
    const target = document.getElementById(id);
    if(target) { target.style.display = 'block'; setTimeout(() => target.classList.add('active'), 10); }
    window.scrollTo(0, 0);
}
function goToLobby() { switchScreen('screen-lobby'); }
function backToKategori() { switchScreen('screen-kategori'); }
function tutupKonfirmasi() { document.getElementById('confirm-overlay').style.display = 'none'; }

function openKategori(cat) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    
    if (cat === 'sub_ewallet') {
        ['dana', 'gopay', 'ovo', 'shopeepay'].forEach(w => {
            listDiv.innerHTML += `<div onclick="openOrder('${w}', '${w.toUpperCase()}', 'NOMOR HP', false)" class="glass menu-item"><span>${w.toUpperCase()}</span></div>`;
        });
    } else {
        databaseLayanan[cat].forEach(item => {
            let func = item.comingSoon ? `kustomAlert('Segera Hadir', 'Sabar ya!')` :
                       item.isAppGroup ? `openSubSosmed('${item.id}')` :
                       item.id === 'sub_ewallet' ? `openKategori('sub_ewallet')` :
                       `openOrder('${item.id}', '${item.name}', '${item.label}', false)`;
            listDiv.innerHTML += `<div onclick="${func}" class="glass menu-item"><img src="${item.icon}"><span>${item.name}</span></div>`;
        });
    }
    switchScreen('screen-kategori');
}

function openSubSosmed(appId) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = `<p style="text-align:center; font-size:11px; color:#ff85b3; margin-bottom:15px;">⚠️ Akun dilarang private!</p>`;
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `<div onclick="openOrder('${sub.id}', '${sub.name}', '${sub.label}', true, '${sub.note || ""}')" class="glass menu-item"><span>${sub.name}</span></div>`;
    });
}

function openOrder(id, name, label, isSosmed) {
    currentServiceId = id; 
    selectedProduct = ""; selectedPrice = "";
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = label;
    const inputTujuan = document.getElementById('user-id');
    const inputZona = document.getElementById('zone-id');
    const grid = document.getElementById('grid-produk');
    const kalkulatorCont = document.getElementById('kalkulator-sosmed-container');
    const logoCont = document.getElementById('operator-logo-container');

    inputTujuan.value = ""; inputZona.value = "";
    if(logoCont) logoCont.style.display = 'none';
    if(kalkulatorCont) { kalkulatorCont.style.display = 'none'; kalkulatorCont.innerHTML = ""; }
    
    inputZona.style.display = (id === 'ml') ? 'block' : 'none';

    if (['dana', 'gopay', 'ovo', 'shopeepay'].includes(id)) {
        renderProductsEwallet(id);
    } else if (id === 'pulsa') {
        grid.innerHTML = "<p style='color:#aaa; text-align:center;'>Masukkan nomor HP...</p>";
        inputTujuan.oninput = function() { handleDeteksiOperator(this.value); };
    } else {
        renderProducts(id);
    }

    if (isSosmed && hargaSatuan[id]) {
        const data = hargaSatuan[id];
        kalkulatorCont.style.display = 'block';
        kalkulatorCont.innerHTML = `
            <div style="background: rgba(255,133,179,0.1); padding: 15px; border-radius: 15px; border: 1px dashed #ff85b3;">
                <label style="font-size:11px; font-weight:bold; color:#ff85b3;">INPUT JUMLAH (Min: ${data.min.toLocaleString()} - Max: ${data.max.toLocaleString()})</label>
                <input type="number" id="custom-qty" placeholder="Masukkan jumlah..." style="margin-top:8px;" oninput="hitungHargaOtomatis(this.value, '${id}')">
                <div id="display-harga-otomatis" style="margin-top:10px; font-weight:bold; color:#ff85b3; text-align:right;">Total: Rp0</div>
            </div>`;
    }
    switchScreen('screen-order');
}

function renderProductsEwallet(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    if(pricelistEwallet[id]) {
        pricelistEwallet[id].forEach(p => {
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card"><span>${p.item}</span><br><b>${p.harga}</b></div>`;
        });
    }
}

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    // Gabungkan data dari games.js dan sosmed.js
    const allProducts = { ...pricelistGame, ...pricelistSosmed };
    const data = allProducts[id];
    if(data) {
        data.forEach(p => {
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card"><span>${p.item}</span><br><b>${p.harga}</b></div>`;
        });
    }
}

function handleDeteksiOperator(nomor) {
    if (nomor.length < 4) return;
    const prefix = nomor.slice(0, 4);
    let provider = "";
    if (/^0811|0812|0813|0821|0822|0852/.test(prefix)) provider = "telkomsel";
    else if (/^0857|0858/.test(prefix)) provider = "indosat";
    else if (/^0817|0818|0819|0877|0831|0838/.test(prefix)) provider = "xl_axis";
    else if (/^0895|0896|0897/.test(prefix)) provider = "three";

    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    if (provider && pricelistPPOB[provider]) {
        const jam = new Date().getHours();
        if (jam >= 22 || jam < 4) {
            grid.innerHTML = "<p style='color:red; text-align:center;'>Layanan Pulsa Tutup (22:00 - 04:00)</p>";
            return;
        }
        pricelistPPOB[provider].forEach(p => {
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card"><span>${p.item}</span><br><b>${p.harga}</b></div>`;
        });
    }
}

function hitungHargaOtomatis(qty, id) {
    const data = hargaSatuan[id];
    const display = document.getElementById('display-harga-otomatis');
    const qtyNum = parseInt(qty);

    if (!qtyNum || qtyNum < data.min) {
        display.innerHTML = `<span style="color:red">Minimal: ${data.min}</span>`;
        selectedProduct = ""; return;
    }
    if (qtyNum > data.max) {
        display.innerHTML = `<span style="color:red">Maksimal: ${data.max}</span>`;
        selectedProduct = ""; return;
    }

    const total = Math.ceil(qtyNum * data.price);
    selectedProduct = `${qtyNum.toLocaleString()} ${id.replace('_', ' ').toUpperCase()}`;
    selectedPrice = `Rp${total.toLocaleString('id-ID')}`;
    display.innerText = `Total: ${selectedPrice}`;
}

function selectItem(item, harga, el) {
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const customQty = document.getElementById('custom-qty');
    if(customQty) customQty.value = ""; // Reset kalkulator kalau pilih paket
}

function tampilkanKonfirmasi() {
    if (!selectedProduct || !document.getElementById('user-id').value) {
        return kustomAlert("Lengkapi Data", "Pilih produk dan isi tujuan!");
    }
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    const admin = getCurrentAdmin();
    const tujuan = document.getElementById('user-id').value;
    const zone = document.getElementById('zone-id').value;
    const finalTujuan = zone ? `${tujuan} (${zone})` : tujuan;
    const textWA = `*ORDER SYRUMI STORE*\n\n*Produk:* ${selectedProduct}\n*Tujuan:* ${finalTujuan}\n*Harga:* ${selectedPrice}\n\n${admin.noteBayar}`;
    window.location.href = `https://wa.me/${admin.nomor}?text=${encodeURIComponent(textWA)}`;
}
