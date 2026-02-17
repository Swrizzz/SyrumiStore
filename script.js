let selectedProduct = "", selectedPrice = "", currentServiceId = "", requiredPattern = "";

// --- KONFIGURASI ADMIN ---
const ADMIN_A = "6289507913948"; 
const ADMIN_B = "6285924527083"; 

function getCurrentAdmin() {
    const detik = new Date().getSeconds();
    return (detik % 2 === 0) ? 
    { nomor: ADMIN_A, label: "ADMIN A", noteBayar: "- DANA: 089507913948\n- QRIS: https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504" } : 
    { nomor: ADMIN_B, label: "ADMIN B", noteBayar: "- DANA: 085924527083\n- QRIS: Minta ke Admin" };
}

// --- UI HELPERS ---
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

// --- LOGIC LAYANAN ---
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
            listDiv.innerHTML += `<div onclick="${func}" class="glass menu-item"><img src="${item.icon}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/686/686589.png'"><span>${item.name}</span></div>`;
        });
    }
    switchScreen('screen-kategori');
}

function openSubSosmed(appId) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = `<p style="text-align:center; font-size:11px; color:#ff85b3; margin-bottom:15px;">⚠️ Akun dilarang private!</p>`;
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `<div onclick="openOrder('${sub.id}', '${sub.name}', '${sub.label}', true)" class="glass menu-item"><span>${sub.name}</span></div>`;
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
    inputTujuan.oninput = null;

    inputZona.style.display = (id === 'ml') ? 'block' : 'none';

    if (['dana', 'gopay', 'ovo', 'shopeepay'].includes(id)) {
        renderProductsEwallet(id);
    } else if (id === 'pulsa') {
        grid.innerHTML = "<p style='color:#aaa; text-align:center; padding:20px;'>Masukkan nomor HP...</p>";
        inputTujuan.oninput = function() { handleDeteksiOperator(this.value); };
    } else {
        renderProducts(id);
    }

    if (isSosmed && hargaSatuan[id]) {
        const data = hargaSatuan[id];
        kalkulatorCont.style.display = 'block';
        kalkulatorCont.innerHTML = `
            <div style="background: rgba(255,133,179,0.1); padding: 15px; border-radius: 15px; border: 1px dashed #ff85b3;">
                <label style="font-size:11px; font-weight:bold; color:#ff85b3;">JUMLAH (Min: ${data.min.toLocaleString()} - Max: ${data.max.toLocaleString()})</label>
                <input type="number" id="custom-qty" placeholder="Masukkan angka..." style="margin-top:8px; padding:12px;" oninput="hitungHargaOtomatis(this.value, '${id}')">
                <div id="display-harga-otomatis" style="margin-top:10px; font-weight:bold; color:#ff85b3; text-align:right;">Total: Rp0</div>
            </div>`;
    }
    switchScreen('screen-order');
}

function renderProductsEwallet(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    if(typeof pricelistPPOB !== 'undefined' && pricelistPPOB[id]) {
        pricelistPPOB[id].forEach(p => {
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card"><span>${p.item}</span><br><b>${p.harga}</b></div>`;
        });
    }
}

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    const all = { ...(typeof pricelistGame !== 'undefined' ? pricelistGame : {}), ...(typeof pricelistSosmed !== 'undefined' ? pricelistSosmed : {}) };
    if(all[id]) {
        all[id].forEach(p => {
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
    else if (/^0881|0882|0883|0884|0885|0886|0887|0888/.test(prefix)) provider = "smartfren";

    const logoImg = document.getElementById('operator-logo');
    const logoCont = document.getElementById('operator-logo-container');
    const grid = document.getElementById('grid-produk');

    if (provider && pricelistPPOB[provider]) {
        logoImg.src = `images/${provider}.jfif`; 
        logoCont.style.display = 'block';
        grid.innerHTML = "";
        pricelistPPOB[provider].forEach(p => {
            grid.innerHTML += `<div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card"><span>${p.item}</span><br><b>${p.harga}</b></div>`;
        });
    }
}

function hitungHargaOtomatis(qty, id) {
    const display = document.getElementById('display-harga-otomatis');
    const data = hargaSatuan[id];
    const qtyNum = parseInt(qty);

    if (!qty || qtyNum <= 0) { display.innerText = "Total: Rp0"; selectedProduct = ""; return; }
    
    if (qtyNum < data.min) {
        display.innerHTML = `<span style="color:red; font-size:10px;">Min: ${data.min.toLocaleString()}</span>`;
        selectedProduct = ""; return;
    }
    if (qtyNum > data.max) {
        display.innerHTML = `<span style="color:red; font-size:10px;">Max: ${data.max.toLocaleString()}</span>`;
        selectedProduct = ""; return;
    }

    const total = Math.ceil(qtyNum * data.price);
    selectedPrice = `Rp${total.toLocaleString('id-ID')}`;
    selectedProduct = `${qtyNum.toLocaleString()} ${id.toUpperCase().replace('TK_', '').replace('IG_', '')}`;
    display.innerHTML = `<span style="color:#ff85b3;">Total: ${selectedPrice}</span>`;
}

function selectItem(item, harga, el) {
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
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

function kirimTestiWA() {
    const admin = getCurrentAdmin();
    const t = document.getElementById('input-testi').value.trim();
    if(!t) return kustomAlert("Kosong", "Tulis testimoninya dulu!");
    window.location.href = `https://wa.me/${admin.nomor}?text=${encodeURIComponent('*TESTIMONI SYRUMI*\n\n"'+t+'"')}`;
}
