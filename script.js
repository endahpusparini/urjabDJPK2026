// =====================================================
// TREE VIEW URJAB DJPK
// Data berasal dari Google Sheets
// =====================================================


// =====================================================
// 1. MASUKKAN GOOGLE SHEET ID DI SINI
// =====================================================

const SHEET_ID = "MASUKKAN_ID_GOOGLE_SHEET_ANDA";

const SHEET_NAME = "URJAB";


// =====================================================
// 2. URL GOOGLE SHEETS
// =====================================================

const DATA_URL =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;


// =====================================================
// 3. SAAT WEBSITE DIBUKA
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    loadData();

});


// =====================================================
// 4. MEMBACA DATA GOOGLE SHEET
// =====================================================

async function loadData() {

    const container = document.getElementById("treeContainer");

    container.innerHTML =
        '<div class="loading">Memuat data dari Google Sheets...</div>';

    try {

        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error("Data Google Sheet tidak dapat diakses.");
        }

        const csvText = await response.text();

        const data = parseCSV(csvText);

        renderTree(data);

    }

    catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="error">
                <strong>Data tidak dapat dimuat.</strong>
                <br><br>
                Pastikan Google Sheet sudah:
                <ul>
                    <li>Dipublish ke web</li>
                    <li>Menggunakan nama sheet: URJAB</li>
                    <li>Spreadsheet ID sudah benar di script.js</li>
                </ul>
            </div>
        `;

    }

}


// =====================================================
// 5. MEMBACA CSV
// =====================================================

function parseCSV(text) {

    const rows = [];

    let row = [];

    let value = "";

    let insideQuotes = false;


    for (let i = 0; i < text.length; i++) {

        const char = text[i];

        const nextChar = text[i + 1];


        if (char === '"' && insideQuotes && nextChar === '"') {

            value += '"';

            i++;

        }

        else if (char === '"') {

            insideQuotes = !insideQuotes;

        }

        else if (char === "," && !insideQuotes) {

            row.push(value);

            value = "";

        }

        else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (char === "\r" && nextChar === "\n") {
                i++;
            }

            row.push(value);

            rows.push(row);

            row = [];

            value = "";

        }

        else {

            value += char;

        }

    }


    if (value !== "" || row.length > 0) {

        row.push(value);

        rows.push(row);

    }


    if (rows.length === 0) {
        return [];
    }


    const headers = rows[0].map(header =>
        header.trim()
    );


    return rows
        .slice(1)
        .filter(row => row.some(value => value.trim() !== ""))
        .map(row => {

            const object = {};

            headers.forEach((header, index) => {

                object[header] =
                    (row[index] || "").trim();

            });

            return object;

        });

}


// =====================================================
// 6. MEMBUAT TREE
// =====================================================

function renderTree(data) {

    const container =
        document.getElementById("treeContainer");

    container.innerHTML = "";


    if (data.length === 0) {

        container.innerHTML =
            '<div class="error">Tidak ada data.</div>';

        return;

    }


    // ---------------------------------------------
    // Membuat index berdasarkan ID
    // ---------------------------------------------

    const byId = {};

    data.forEach(item => {

        byId[item["ID"]] = item;

    });


    // ---------------------------------------------
    // Membuat root
    // ---------------------------------------------

    const root = document.createElement("div");

    root.className = "tree";


    const rootNode = document.createElement("div");

    rootNode.className = "node root";

    rootNode.innerHTML = `
        <span class="icon">−</span>
        <div>
            <strong>Direktorat Jenderal Perimbangan Keuangan</strong>
            <small>Tree View Uraian Jabatan</small>
        </div>
    `;


    root.appendChild(rootNode);


    // ---------------------------------------------
    // Data Level 1
    // ---------------------------------------------

    const level1 =
        data.filter(item =>
            String(item["Lv"]).trim() === "1"
        );


    const level1Container =
        document.createElement("div");

    level1Container.className = "children";


    level1.forEach(item => {

        level1Container.appendChild(
            createNode(item, data)
        );

    });


    root.appendChild(level1Container);

    container.appendChild(root);


    // ---------------------------------------------
    // Aktifkan pencarian
    // ---------------------------------------------

    setupSearch();

}


// =====================================================
// 7. MEMBUAT NODE
// =====================================================

function createNode(item, allData) {

    const branch =
        document.createElement("div");

    branch.className = "branch";


    const node =
        document.createElement("div");

    node.className = "node unit";

    node.dataset.search =
        `${item["Unit"]} ${item["Kelompok Tugas"]} ${item["Uraian Jabatan"]} ${item["Hasil Kerja"]}`.toLowerCase();


    const icon =
        document.createElement("span");

    icon.className = "icon";

    icon.textContent = "+";


    const content =
        document.createElement("div");


    content.innerHTML = `
        <strong>${escapeHTML(item["Unit"])}</strong>
        <small>
            ID: ${escapeHTML(item["ID"])}
            ${item["Kelompok Tugas"]
                ? " | " + escapeHTML(item["Kelompok Tugas"])
                : ""}
        </small>
    `;


    node.appendChild(icon);

    node.appendChild(content);


    // ---------------------------------------------
    // Container anak
    // ---------------------------------------------

    const children =
        document.createElement("div");

    children.className =
        "children hidden";


    // ---------------------------------------------
    // Cari anak berdasarkan Parent-ID
    // ---------------------------------------------

    const childItems =
        allData.filter(child =>
            child["Parent-ID"] === item["ID"]
        );


    // ---------------------------------------------
    // Tambahkan child
    // ---------------------------------------------

    childItems.forEach(child => {

        children.appendChild(
            createNode(child, allData)
        );

    });


    // ---------------------------------------------
    // Tambahkan uraian jabatan
    // ---------------------------------------------

    const task =
        document.createElement("div");

    task.className = "task";


    task.innerHTML = `

        <div class="task-title">
            Uraian Jabatan
        </div>

        <div class="task-description">
            ${formatText(item["Uraian Jabatan"])}
        </div>

        <div class="output-title">
            Hasil Kerja
        </div>

        <div class="output">
            ${formatText(item["Hasil Kerja"])}
        </div>

        ${
            item["Keterangan"]
            ?
            `
            <div class="note">
                ${formatText(item["Keterangan"])}
            </div>
            `
            :
            ""
        }

    `;


    // ---------------------------------------------
    // Masukkan task ke children
    // ---------------------------------------------

    children.insertBefore(
        task,
        children.firstChild
    );


    // ---------------------------------------------
    // Tombol expand/collapse
    // ---------------------------------------------

    node.addEventListener("click", function () {

        if (
            children.classList.contains("hidden")
        ) {

            children.classList.remove("hidden");

            icon.textContent = "−";

        }

        else {

            children.classList.add("hidden");

            icon.textContent = "+";

        }

    });


    branch.appendChild(node);

    branch.appendChild(children);


    return branch;

}


// =====================================================
// 8. FORMAT TEXT
// =====================================================

function formatText(text) {

    if (!text) {
        return "-";
    }

    return escapeHTML(text)
        .replace(/\n/g, "<br>");
}


// =====================================================
// 9. KEAMANAN HTML
// =====================================================

function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// 10. EXPAND ALL
// =====================================================

function expandAll() {

    document
        .querySelectorAll(".children")
        .forEach(element => {

            element.classList.remove("hidden");

        });


    document
        .querySelectorAll(".icon")
        .forEach(icon => {

            icon.textContent = "−";

        });

}


// =====================================================
// 11. COLLAPSE ALL
// =====================================================

function collapseAll() {

    document
        .querySelectorAll(".children")
        .forEach(element => {

            element.classList.add("hidden");

        });


    document
        .querySelectorAll(".icon")
        .forEach(icon => {

            icon.textContent = "+";

        });

}


// =====================================================
// 12. SEARCH
// =====================================================

function setupSearch() {

    const searchBox =
        document.getElementById("searchBox");


    if (!searchBox) {
        return;
    }


    searchBox.addEventListener(
        "input",
        function () {

            const keyword =
                searchBox.value.toLowerCase();


            document
                .querySelectorAll(".branch")
                .forEach(branch => {

                    const text =
                        branch.innerText.toLowerCase();


                    if (
                        keyword === "" ||
                        text.includes(keyword)
                    ) {

                        branch.style.display = "";

                    }

                    else {

                        branch.style.display = "none";

                    }

                });

        }
    );

}
