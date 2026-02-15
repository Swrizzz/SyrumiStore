let selectedProduct = "", selectedPrice = "", currentServiceId = "", currentUnitName = "Pcs";

function kustomAlert(title, message, icon = "⚠️") {
    document.getElementById('alert-icon').innerText = icon;
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerText = message;
    document.getElementById('alert-overlay').style.display = 'flex';
}

function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }

// Fungsi Testimoni
function bukaTesti() { document.getElementById('testi-overlay').style.display = 'flex'; }
function tutupTesti() { document.getElementById('testi-overlay').style.display = 'none'; }

function konfirmasiSaluran() {
    tutupTesti();
    kustomAlert("Dialihkan!", "Kamu akan diarahkan ke Saluran WhatsApp Syrumi Store untuk melihat testimoni lengkap.", "🚀");
    setTimeout(() => {
        window.location.href = "https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504";
    }, 2000);
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const target = document.getElementById(id);
    target.style.display = 'block';
    setTimeout(() => { target.classList.add('active'); }, 10);
    window.scrollTo(0, 0);
}

function openKategori(cat) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    databaseLayanan[cat].forEach(item => {
        const func = item.isAppGroup ? `openSubSosmed('${item.id}')` : `openOrder('${item.id}', '${item.name}', '${item.label}', false)`;
        listDiv.innerHTML += `<div onclick="${func}" class="glass menu-item"><img src="${item.icon}"><span>${item.name}</span></div>`;
    });
    switchScreen('screen-kategori');
}

function openSubSosmed(appId) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `<div onclick="openOrder('${sub.id}', '${sub.name}', '${sub.label}', true, '${sub.unit}')" class="glass menu-item"><i class="fas fa-chevron-right" style="margin-right:15px; color:#ff85b3;"></i><span>${sub.name}</span></div>`;
    });
}

function openOrder(id, name, label, manual, unitName = "Pcs") {
    currentServiceId = id; 
    currentUnitName = unitName;
    selectedProduct = ""; 
    selectedPrice = "";
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = label;
    const inputTujuan = document.getElementById('user-id');
    inputTujuan.value = "";
    document.getElementById('operator-logo-container').style.display = 'none';

    if (id === 'pulsa') {
        inputTujuan.placeholder = "Contoh: 08123456789";
    } else if (id === 'ml' || id === 'ff') {
        inputTujuan.placeholder = "Masukkan ID";
    } else {
        inputTujuan.placeholder = "Masukkan Link / Username";
    }
    
    document.getElementById('zone-id').style.display = (id === 'ml') ? 'block' : 'none';
    const grid = document.getElementById('grid-produk');
    if (id === 'pulsa') {
        grid.innerHTML = "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Masukkan nomor HP...</p>";
    } else {
        renderProducts(id);
    }
    switchScreen('screen-order');
}

function deteksiOperator(nomor) {
    if (nomor.length < 4) return null;
    const prefix = nomor.slice(0, 4);
    if (/^0811|0812|0813|0821|0822|0823|0851|0852|0853$/.test(prefix)) return "telkomsel";
    if (/^0814|0815|0816|0855|0856|0857|0858$/.test(prefix)) return "indosat";
    if (/^0817|0818|0819|0859|0877|0878|0831|0832|0833|0838$/.test(prefix)) return "xl_axis";
    if (/^0895|0896|0897|0898|0899$/.test(prefix)) return "three";
    if (/^0881|0882|0883|0884|0885|0886|0887|0888|0889$/.test(prefix)) return "smartfren";
    return null;
}

document.addEventListener('keyup', function(e) {
    if (e.target && e.target.id === 'user-id' && currentServiceId === 'pulsa') {
        const provider = deteksiOperator(e.target.value);
        const logoCont = document.getElementById('operator-logo-container');
        const logoImg = document.getElementById('operator-logo');
        const daftarLogo = {
            "telkomsel": "images/telkomsel.jfif", 
            "indosat":   "images/indosat.jfif",
            "xl_axis":   "images/XL.jfif",
            "three":     "images/three.jfif",
            "smartfren": "images/smartfren.jfif"
        };
        if (provider) {
            renderProductsPulsa(provider);
            logoImg.src = daftarLogo[provider]; 
            logoCont.style.display = 'block';
        } else {
            logoCont.style.display = 'none';
        }
    }
});

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = pricelist[id] ? "" : "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Paket segera hadir...</p>";
    if(pricelist[id]) {
        pricelist[id].forEach(p => {
            let labelText = p.label ? p.label : (p.isPremium ? "👑 HOT" : "");
            const labelHTML = labelText ? `<span class="badge-premium">${labelText}</span>` : '';
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${p.isPremium ? 'premium' : ''}">
                    <span class="item-name">${p.item} ${labelHTML}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    }
}

function renderProductsPulsa(provider) {
    const grid = document.getElementById('grid-produk');
    if (pricelist.pulsa && pricelist.pulsa[provider]) {
        grid.innerHTML = "";
        pricelist.pulsa[provider].forEach(p => {
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card">
                    <span class="item-name">${p.item}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    }
}

function selectItem(item, harga, el) {
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function tampilkanKonfirmasi() {
    const val = document.getElementById('user-id').value;
    if(!val) return kustomAlert("Data Kosong", "Isi nomor/ID tujuan!", "❌");
    if(!selectedProduct) return kustomAlert("Pilihan Kosong", "Pilih nominal dulu!", "🛒");
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    let val = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value;
    // Perbaikan: Hanya mengambil selectedProduct agar tidak dobel dengan kategori
    const namaProdukFix = selectedProduct; 
    
    let tujuan = (currentServiceId === 'ml' && zone) ? `${val} (${zone})` : val;
    const linkTesti = "https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504"; 

    const instruksi = 
        `----------------------------\n` +
        `[ CARA PENYELESAIAN ]\n` +
        `1. Transfer sesuai total di atas.\n` +
        `2. Kirim Bukti Bayar di chat ini.\n` +
        `3. Pesanan akan segera Diproses.\n` +
        `----------------------------\n` +
        `[ METODE PEMBAYARAN ]\n` +
        `- DANA: 089507913948\n` +
        `- QRIS: `${linkTesti}\n` +
        `----------------------------\n` +
        `[ CATATAN ADMIN ]\n` +
        `Mohon bersabar jika belum dibalas. Proses 100% Manual & Sesuai Antrean! 🙏\n` +
        `----------------------------`;

    const pesan = window.encodeURIComponent(
        `*ORDER BARU SYRUMISTORE*\n\n` +
        `*Produk:* ${namaProdukFix}\n` + 
        `*Tujuan:* ${tujuan}\n` +
        `*Harga: ${selectedPrice}*\n\n` +
        `${instruksi}\n\n` +
        `_Silakan kirim bukti transfer agar segera diproses._`
    );

    window.location.href = `https://wa.me/6289507913948?text=${pesan}`;
}

function goToLobby() { switchScreen('screen-lobby'); }
function backToKategori() { switchScreen('screen-kategori'); }
function tutupKonfirmasi() { document.getElementById('confirm-overlay').style.display = 'none'; }
