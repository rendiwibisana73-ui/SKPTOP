// Array untuk menyimpan data alternatif yang diinput user
let alternatives = [];

// Bobot dan Sifat Kriteria bawaan sesuai ketentuan lu
const weights = [0.4, 0.3, 0.2, 0.1];
const isBenefit = [false, true, true, true]; // C1 Cost(false), C2,C3,C4 Benefit(true)

function addAlternative() {
    const name = document.getElementById('name').value;
    const c1 = parseFloat(document.getElementById('c1').value);
    const c2 = parseFloat(document.getElementById('c2').value);
    const c3 = parseFloat(document.getElementById('c3').value);
    const c4 = parseFloat(document.getElementById('c4').value);

    if (!name || isNaN(c1) || isNaN(c2) || isNaN(c3) || isNaN(c4)) {
        alert("Isi semua form dengan benar sebelum menambah data.");
        return;
    }

    // Push data ke array
    alternatives.push({ name, c1, c2, c3, c4 });
    renderTable();
    
    // Clear input forms
    document.getElementById('name').value = '';
    document.getElementById('c1').value = '';
    document.getElementById('c2').value = '';
    document.getElementById('c3').value = '';
    document.getElementById('c4').value = '';
}

function renderTable() {
    const tbody = document.getElementById('dataBody');
    tbody.innerHTML = '';
    alternatives.forEach(alt => {
        tbody.innerHTML += `
            <tr>
                <td>${alt.name}</td>
                <td>${alt.c1}</td>
                <td>${alt.c2}</td>
                <td>${alt.c3}</td>
                <td>${alt.c4}</td>
            </tr>
        `;
    });
}

function calculateTOPSIS() {
    if (alternatives.length < 2) {
        alert("Masukkan minimal 2 kandidat untuk melakukan perangkingan.");
        return;
    }

    const n = alternatives.length;
    const m = 4; // Jumlah kriteria
    const matrix = alternatives.map(a => [a.c1, a.c2, a.c3, a.c4]);

    // 1. Hitung Pembagi (Akar Kuadrat)
    let dividers = [0, 0, 0, 0];
    for (let j = 0; j < m; j++) {
        let sumSq = 0;
        for (let i = 0; i < n; i++) {
            sumSq += Math.pow(matrix[i][j], 2);
        }
        dividers[j] = Math.sqrt(sumSq);
    }

    // 2. Normalisasi Matriks Terbobot
    let weightedMatrix = Array.from({ length: n }, () => Array(m).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            let r = matrix[i][j] / dividers[j];
            weightedMatrix[i][j] = r * weights[j];
        }
    }

    // 3. Solusi Ideal Positif (A+) & Negatif (A-)
    let idealPos = [0, 0, 0, 0];
    let idealNeg = [0, 0, 0, 0];

    for (let j = 0; j < m; j++) {
        let col = weightedMatrix.map(row => row[j]);
        if (isBenefit[j]) {
            idealPos[j] = Math.max(...col);
            idealNeg[j] = Math.min(...col);
        } else {
            idealPos[j] = Math.min(...col); // Karena Cost, nilai terkecil adalah positif
            idealNeg[j] = Math.max(...col);
        }
    }

    // 4. Jarak Solusi Ideal & Nilai Preferensi (V)
    let results = [];
    for (let i = 0; i < n; i++) {
        let sumPos = 0;
        let sumNeg = 0;
        for (let j = 0; j < m; j++) {
            sumPos += Math.pow(weightedMatrix[i][j] - idealPos[j], 2);
            sumNeg += Math.pow(weightedMatrix[i][j] - idealNeg[j], 2);
        }
        let dPos = Math.sqrt(sumPos);
        let dNeg = Math.sqrt(sumNeg);
        
        let v = (dNeg + dPos !== 0) ? (dNeg / (dNeg + dPos)) : 0;
        
        results.push({ name: alternatives[i].name, v: v });
    }

    // 5. Perangkingan (Sortir Descending)
    results.sort((a, b) => b.v - a.v);

    // Tampilkan Hasil
    const resultBody = document.getElementById('resultBody');
    resultBody.innerHTML = '';
    results.forEach((res, index) => {
        resultBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${res.name}</td>
                <td>${res.v.toFixed(4)}</td>
            </tr>
        `;
    });
}