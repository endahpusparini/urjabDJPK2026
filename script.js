// =====================================================
// TREE VIEW URJAB DJPK
// Google Sheets CSV → GitHub Pages
// =====================================================

const DATA_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnqIAvEqNOyIMtJAe3gbqKWF8eJe_LSDZOJtSfloFLLv4rkGPyx6Lc1AQEazEV-ZmpR6MJ7dNdfs4J/pub?output=csv";

document.addEventListener("DOMContentLoaded", loadData);


// =====================================================
// LOAD DATA
// =====================================================

async function loadData() {

    const container = document.getElementById("treeContainer");

    container.innerHTML = `
        <div class="loading">
            ⏳ Memuat data dari Google Sheets...
        </div>
    `;

    try {

        const response = await fetch(DATA_URL);

        if (!response.ok) {
            throw new Error(
                "Google Sheets tidak dapat diakses."
            );
        }

        const csvText = await response.text();

        console.log("CSV berhasil diambil:");
        console.log(csvText);

        const data = parseCSV(csvText);

        console.log("Jumlah data:", data.length);
        console.log(data);

        if (data.length === 0) {
            throw new Error("Data Google Sheet kosong.");
        }

        renderTree(data);

    } catch (error) {

        console.error("ERROR:", error);

        container.innerHTML = `
            <div class="error">
                <strong>❌ Data tidak dapat dimuat.</strong>

                <p>
                    Penyebab:
                    ${escapeHTML(error.message)}
                </p>

                <hr>

                <p>
                    Pastikan Google Sheet sudah
                    <strong>Publish to web</strong>
                    dan menggunakan format CSV.
                </p>

                <p>
                    URL sumber data:
                </p>

                <small>
                    Google Sheets CSV
                </small>
            </div>
        `;
    }
}


// =====================================================
// CSV PARSER
// =====================================================

function parseCSV(text) {

    const rows = [];

    let row = [];
    let value = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {

        const char = text[i];
        const nextChar = text[i + 1];

        if (
            char === '"' &&
            insideQuotes &&
            nextChar === '"'
        ) {

            value += '"';
            i++;

        } else if (char === '"') {

            insideQuotes = !insideQuotes;

        } else if (
            char === "," &&
            !insideQuotes
        ) {

            row.push(value);
            value = "";

        } else if (
            (char === "\n" || char === "\r") &&
            !insideQuotes
        ) {

            if (
                char === "\r" &&
                nextChar === "\n"
            ) {
                i++;
            }

            row.push(value);

            if (row.length > 0) {
                rows.push(row);
            }

            row = [];
            value = "";

        } else {

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

    const headers = rows[0].map(
        header => header.trim()
    );

    return rows
        .slice(1)
        .filter(row =>
            row.some(
                value =>
                    String(value).trim() !== ""
            )
        )
        .map(row => {

            const object = {};

            headers.forEach(
                (header, index) => {

                    object[header] =
                        (row[index] || "").trim();
                }
            );

            return object;
        });
}


// =====================================================
// RENDER TREE
// =====================================================

function renderTree(data) {

    const container =
        document.getElementById(
            "treeContainer"
        );

    container.innerHTML = "";

    const root =
        document.createElement("div");

    root.className = "tree";

    // ROOT
    const rootNode =
        document.createElement("div");

    rootNode.className =
        "node root";

    rootNode.innerHTML = `
        <span class="icon">−</span>

        <div>
            <strong>
                Direktorat Jenderal
                Perimbangan Keuangan
            </strong>

            <small>
                Tree View Uraian Jabatan
            </small>
        </div>
    `;

    root.appendChild(rootNode);


    // LEVEL 1
    const level1 =
        data.filter(item =>
            String(item["Lv"]).trim() === "1"
        );

    const level1Container =
        document.createElement("div");

    level1Container.className =
        "children";


    level1.forEach(item => {

        level1Container.appendChild(
            createNode(item, data)
        );

    });


    root.appendChild(
        level1Container
    );

    container.appendChild(root);

    setupSearch();
}


// =====================================================
// CREATE NODE
// =====================================================

function createNode(item, allData) {

    const branch =
        document.createElement("div");

    branch.className =
        "branch";


    // NODE
    const node =
        document.createElement("div");

    node.className =
        "node unit";


    node.dataset.search = `
        ${item["Unit"] || ""}
        ${item["Kelompok Tugas"] || ""}
        ${item["Uraian Jabatan"] || ""}
        ${item["Hasil Kerja"] || ""}
    `.toLowerCase();


    // ICON
    const icon =
        document.createElement("span");

    icon.className =
        "icon";

    icon.textContent = "+";


    // CONTENT
    const content =
        document.createElement("div");

    content.innerHTML = `
        <strong>
            ${escapeHTML(item["Unit"] || "-")}
        </strong>

        <small>
            ID:
            ${escapeHTML(item["ID"] || "-")}

            ${
                item["Kelompok Tugas"]
                ?
                " | " +
                escapeHTML(
                    item["Kelompok Tugas"]
                )
                :
                ""
            }
        </small>
    `;


    node.appendChild(icon);
    node.appendChild(content);


    // CHILDREN
    const children =
        document.createElement("div");

    children.className =
        "children hidden";


    const childItems =
        allData.filter(child =>
            String(child["Parent-ID"]).trim() ===
            String(item["ID"]).trim()
        );


    childItems.forEach(child => {

        children.appendChild(
            createNode(
                child,
                allData
            )
        );

    });


    // TASK DETAIL
    const task =
        document.createElement("div");

    task.className =
        "task";

    task.innerHTML = `

        <div class="task-title">
            Uraian Jabatan
        </div>

        <div class="task-description">
            ${
                formatText(
                    item["Uraian Jabatan"]
                )
            }
        </div>

        <div class="output-title">
            Hasil Kerja
        </div>

        <div class="output">
            ${
                formatText(
                    item["Hasil Kerja"]
                )
            }
        </div>

        ${
            item["Keterangan"]
            ?
            `
            <div class="note">
                ${formatText(
                    item["Keterangan"]
                )}
            </div>
            `
            :
            ""
        }

    `;


    children.insertBefore(
        task,
        children.firstChild
    );


    // CLICK
    node.addEventListener(
        "click",
        function () {

            if (
                children.classList.contains(
                    "hidden"
                )
            ) {

                children.classList.remove(
                    "hidden"
                );

                icon.textContent = "−";

            } else {

                children.classList.add(
                    "hidden"
                );

                icon.textContent = "+";
            }

        }
    );


    branch.appendChild(node);
    branch.appendChild(children);

    return branch;
}


// =====================================================
// FORMAT TEXT
// =====================================================

function formatText(text) {

    if (!text) {
        return "-";
    }

    return escapeHTML(text)
        .replace(/\n/g, "<br>");
}


// =====================================================
// SECURITY
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
// EXPAND ALL
// =====================================================

function expandAll() {

    document
        .querySelectorAll(".children")
        .forEach(element => {

            element.classList.remove(
                "hidden"
            );

        });

    document
        .querySelectorAll(".icon")
        .forEach(icon => {

            icon.textContent = "−";

        });
}


// =====================================================
// COLLAPSE ALL
// =====================================================

function collapseAll() {

    document
        .querySelectorAll(".children")
        .forEach(element => {

            element.classList.add(
                "hidden"
            );

        });

    document
        .querySelectorAll(".icon")
        .forEach(icon => {

            icon.textContent = "+";

        });
}


// =====================================================
// SEARCH
// =====================================================

function setupSearch() {

    const searchBox =
        document.getElementById(
            "searchBox"
        );

    if (!searchBox) {
        return;
    }


    searchBox.addEventListener(
        "input",
        function () {

            const keyword =
                searchBox.value
                    .toLowerCase()
                    .trim();


            document
                .querySelectorAll(".branch")
                .forEach(branch => {

                    const text =
                        branch.innerText
                            .toLowerCase();

                    if (
                        keyword === "" ||
                        text.includes(keyword)
                    ) {

                        branch.style.display =
                            "";

                    } else {

                        branch.style.display =
                            "none";
                    }

                });

        }
    );
}
