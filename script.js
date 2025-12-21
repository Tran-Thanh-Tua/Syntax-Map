// thiet lap chung
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");

const busListEl = document.getElementById("busList");
const shortestEl = document.getElementById("shortestPath");
const busSuggestTitle = document.getElementById("busSuggestTitle");
const busSuggestEl = document.getElementById("busSuggest");

// tram xe buyt
const positions = {
    S01: { x: 60, y: 60 }, S02: { x: 180, y: 60 }, S03: { x: 320, y: 60 }, S04: { x: 480, y: 60 }, S05: { x: 620, y: 60 }, S06: { x: 760, y: 60 },
    S07: { x: 60, y: 160 }, S08: { x: 180, y: 160 }, S09: { x: 320, y: 160 }, S10: { x: 480, y: 160 }, S11: { x: 620, y: 160 }, S12: { x: 760, y: 160 },
    S13: { x: 60, y: 260 }, S14: { x: 180, y: 260 }, S15: { x: 320, y: 260 }, S16: { x: 420, y: 230 }, S17: { x: 620, y: 260 }, S18: { x: 760, y: 260 },
    S19: { x: 60, y: 360 }, S20: { x: 180, y: 360 }, S21: { x: 320, y: 360 }, S22: { x: 480, y: 360 }, S23: { x: 620, y: 360 }, S24: { x: 760, y: 360 },
    S25: { x: 60, y: 480 }, S26: { x: 180, y: 480 }, S27: { x: 320, y: 480 }, S28: { x: 480, y: 480 }, S29: { x: 620, y: 480 }, S30: { x: 760, y: 480 }
};

// tuyen xe buyt
const busRoutes = {
    1: ["S01", "S07", "S13", "S19", "S20", "S21", "S27"],
    2: ["S02", "S08", "S14", "S20", "S21", "S22", "S23", "S24"],
    3: ["S25", "S26", "S27", "S21", "S22", "S28", "S29", "S30"],
    4: ["S13", "S14", "S08", "S02", "S03", "S04", "S05", "S11", "S12", "S06"],
    5: ["S26", "S20", "S14", "S15", "S16", "S10", "S11", "S17", "S23", "S29"],
    6: ["S30", "S24", "S23", "S22", "S21", "S20", "S14", "S15", "S09", "S03"],
    7: ["S05", "S04", "S10", "S09", "S08", "S14", "S20", "S26", "S25"],
    8: ["S06", "S12", "S18", "S17", "S11", "S10", "S16", "S15", "S14", "S13", "S07", "S01"],
    9: ["S27", "S21", "S22", "S23", "S24", "S18", "S12", "S06"],
    10: ["S26", "S20", "S14", "S08", "S02", "S03", "S04", "S10", "S11", "S12"]
};

// Ban do dang do thi vo huong co trong so
const graph = {};
function addEdge(a, b, w) {
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    if (!graph[a].some(e => e.to === b)) graph[a].push({ to: b, w });
    if (!graph[b].some(e => e.to === a)) graph[b].push({ to: a, w });
}

for (let bus in busRoutes) {
    const r = busRoutes[bus];

    // trong so giua 2 hang
    // 1 - 2
    addEdge("S01", "S07", 3);
    addEdge("S02", "S08", 5);
    addEdge("S03", "S09", 3);
    addEdge("S04", "S10", 9);
    addEdge("S05", "S11", 9);
    addEdge("S06", "S12", 8);

    // 2 - 3
    addEdge("S07", "S13", 7);
    addEdge("S08", "S14", 3);
    addEdge("S09", "S15", 5);
    addEdge("S10", "S16", 2);
    addEdge("S11", "S17", 1);
    addEdge("S12", "S18", 5);

    // 3 - 4
    addEdge("S13", "S19", 8);
    addEdge("S14", "S20", 7);
    addEdge("S17", "S23", 2);
    addEdge("S18", "S24", 4);

    // 4 - 5
    addEdge("S20", "S26", 4);
    addEdge("S21", "S27", 3);
    addEdge("S22", "S28", 8);
    addEdge("S23", "S29", 7);
    addEdge("S24", "S30", 8);

    // trong so giua 2 dinh trong 1 hang
    // 1
    addEdge("S02", "S03", 7);
    addEdge("S03", "S04", 5);
    addEdge("S04", "S05", 8);

    // 2
    addEdge("S08", "S09", 7);
    addEdge("S09", "S10", 4);
    addEdge("S10", "S11", 6);
    addEdge("S11", "S12", 3);

    // 3
    addEdge("S13", "S14", 4);
    addEdge("S14", "S15", 5);
    addEdge("S15", "S16", 2);
    addEdge("S17", "S18", 2);

    // 4
    addEdge("S19", "S20", 2);
    addEdge("S20", "S21", 3);
    addEdge("S21", "S22", 2);
    addEdge("S22", "S23", 4);
    addEdge("S23", "S24", 7);

    // 5
    addEdge("S25", "S26", 2);
    addEdge("S26", "S27", 1);
    addEdge("S28", "S29", 6);
    addEdge("S29", "S30", 5);
}

// dia diem
const buildings = [
    { name: "Bệnh viện Quận 7", icon: "🏥", x: 325, y: 135 },
    { name: "Trường THPT Nguyễn Trãi", icon: "🏫", x: 510, y: 325 },
    { name: "Ngân hàng ACB", icon: "🏦", x: 60, y: 350 },
    { name: "Tòa nhà Văn phòng CityView", icon: "🏢", x: 380, y: 450 },
    { name: "Trạm Cứu hỏa Quận 7", icon: "🚒", x: 625, y: 235 },
    { name: "Siêu thị BigMart", icon: "🛒", x: 685, y: 340 },
    { name: "Sân vận động Thành Phố", icon: "🏟️", x: 540, y: 130 },
    { name: "Thư viện Trung tâm", icon: "📚", x: 240, y: 240 },
    { name: "Công viên Ánh Sáng", icon: "🌳", x: 490, y: 240 },
    { name: "Khu Chung cư SunHome", icon: "🏘️", x: 90, y: 445 },
    { name: "Bảo tàng Lịch sử", icon: "🏛️", x: 630, y: 450 },
    { name: "Nhà máy KCN Tân Thuận", icon: "🏭", x: 90, y: 25 }
];

const iconSize = 50;

for (let id in positions) if (!graph[id]) graph[id] = [];

// tuong tac nguoi dung
let hoverNode = null;
let selectedNodes = [];
let activeBus = null;
let highlightedShortest = [];
const popup = document.getElementById("popup");
let offsetX = 0, offsetY = 0;
const NODE_RADIUS = 20;

function computeOffsets() {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const id in positions) {
        const p = positions[id];
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
    }
    const contentW = maxX - minX;
    const contentH = maxY - minY;
    const pad = 40;
    offsetX = Math.round((canvas.width - contentW) / 2 - minX);
    offsetY = Math.round((canvas.height - contentH) / 2 - minY);
    offsetX = Math.max(offsetX, pad - minX);
    offsetY = Math.max(offsetY, pad - minY);
}

function getPos(id) {
    const p = positions[id];
    return { x: p.x + offsetX, y: p.y + offsetY };
}

function drawGraph() {
    computeOffsets();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    for (let b of buildings) {
        ctx.font = "28px Arial";
        ctx.fillText(b.icon, b.x - 14, b.y + 10);
    }
    const drawn = new Set();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000000";

    for (let u in graph) {
        for (let e of graph[u]) {
            const v = e.to;
            const key = [u, v].sort().join("|");
            if (drawn.has(key)) continue;
            drawn.add(key);

            const a = getPos(u), b = getPos(v);
            if (!a || !b) continue;

            const mx = (a.x + b.x) / 2;
            const my = (a.y + b.y) / 2;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const len = Math.hypot(dx, dy);
            const ux = dx / len;
            const uy = dy / len;

            // trong so nam giua canh
            const cut = 12;
            const m1x = mx - ux * cut;
            const m1y = my - uy * cut;

            const m2x = mx + ux * cut;
            const m2y = my + uy * cut;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(m1x, m1y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(m2x, m2y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
            ctx.fillText(e.w, mx, my); 
        }
    }

    // highlight tuyen xe buyt hoat dong
    if (activeBus) {
        const route = busRoutes[activeBus];
        ctx.lineWidth = 5;
        ctx.strokeStyle = "#ff4d4f";
        ctx.beginPath();
        for (let i = 0; i < route.length - 1; i++) {
            const a = getPos(route[i]), b = getPos(route[i + 1]);
            if (a && b) {
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
            }
        }
        ctx.stroke();
    }

    // highlight duong di ngan nhat
    if (highlightedShortest && highlightedShortest.length > 1) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#34c3ff";
        ctx.beginPath();
        for (let i = 0; i < highlightedShortest.length - 1; i++) {
            const a = getPos(highlightedShortest[i]), b = getPos(highlightedShortest[i + 1]);
            if (a && b) {
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
            }
        }
        ctx.stroke();
    }

    // highlight tram
    for (let id in positions) {
        const p = getPos(id);
        const isSelected = selectedNodes.includes(id);
        const isHover = (hoverNode === id);
        const fill = (isSelected || isHover) ? "#fff1a8" : "#ffffff";

        ctx.beginPath();
        ctx.fillStyle = fill;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.arc(p.x, p.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#000000";
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(id, p.x, p.y);
    }
}

// dijkstra (min-heap)
class MinHeap {
    constructor() { this.arr = [] }
    push(node, dist) {
        this.arr.push({ node, dist });
        let i = this.arr.length - 1;

        while (i > 0) {
            let p = (i - 1) >> 1;
            if (this.arr[p].dist <= this.arr[i].dist) break;
            [this.arr[p], this.arr[i]] = [this.arr[i], this.arr[p]];
            i = p;
        }
    }
    pop() {
        const top = this.arr[0];
        const end = this.arr.pop();

        if (this.arr.length > 0) {
            this.arr[0] = end;
            let i = 0;
            while (true) {
                let L = 2 * i + 1, R = 2 * i + 2, S = i;
                if (L < this.arr.length && this.arr[L].dist < this.arr[S].dist) S = L;
                if (R < this.arr.length && this.arr[R].dist < this.arr[S].dist) S = R;
                if (S === i) break;
                [this.arr[i], this.arr[S]] = [this.arr[S], this.arr[i]];
                i = S;
            }
        }
        return top;
    }
    isEmpty() { return this.arr.length === 0 }
}

function dijkstra(start, end) {
    if (!graph[start] || !graph[end]) return null;
    const dist = {}, prev = {};
    for (let v in graph) dist[v] = Infinity;
    dist[start] = 0;
    const pq = new MinHeap();
    pq.push(start, 0);
    while (!pq.isEmpty()) {
        const it = pq.pop();
        if (!it) break;
        const u = it.node;
        const d = it.dist;
        if (d > dist[u]) continue;
        if (u === end) break;
        for (const e of graph[u]) {
            const nd = d + e.w;
            if (nd < dist[e.to]) {
                dist[e.to] = nd;
                prev[e.to] = u;
                pq.push(e.to, nd);
            }
        }
    }
    if (dist[end] === Infinity) return null;
    const path = [];
    let cur = end;
    while (cur) {
        path.unshift(cur);
        if (cur === start) break;
        cur = prev[cur];
    }
    return { path, distance: dist[end] };
}

// ham goi y tuyen
function suggestBusesForPath(path) {
    if (!path || path.length < 2) return [];
    const suggestions = [];
    let i = 0;
    while (i < path.length - 1) {
        const u = path[i], v = path[i + 1];
        let foundBus = null;
        for (const busId in busRoutes) {
            const route = busRoutes[busId];
            for (let k = 0; k < route.length - 1; k++) {
                const a = route[k], b = route[k + 1];
                if ((a === u && b === v) || (a === v && b === u)) {
                    foundBus = Number(busId);
                    break;
                }
            }
            if (foundBus) break;
        }
        if (foundBus === null) {
            suggestions.push({ bus: null, from: u, to: v });
            i++;
        } else {
            let j = i + 1;
            while (j < path.length) {
                const a = path[j - 1], b = path[j];
                let ok = false;
                const route = busRoutes[foundBus];
                for (let k = 0; k < route.length - 1; k++) {
                    if ((route[k] === a && route[k + 1] === b) || (route[k] === b && route[k + 1] === a)) {
                        ok = true; break;
                    }
                }
                if (!ok) break;
                j++;
            }
            suggestions.push({ bus: foundBus, from: path[i], to: path[j - 1] });
            i = j - 1;
        }
    }
    const compressed = [];
    for (const seg of suggestions) {
        if (compressed.length === 0) compressed.push(seg);
        else {
            const prev = compressed[compressed.length - 1];
            if (prev.bus === seg.bus && prev.to === seg.from) {
                prev.to = seg.to;
            } else compressed.push(seg);
        }
    }
    return compressed;
}

// tuong tac voi danh sach tuyen
function buildBusList() {
    busListEl.innerHTML = "";
    for (const id in busRoutes) {
        const li = document.createElement("li");
        li.textContent = `Tuyến ${id}: ${busRoutes[id].join(" - ")}`;
        li.dataset.bus = id;
        li.onclick = () => {
            if (activeBus && Number(activeBus) === Number(id)) { activeBus = null; clearActiveList(); drawGraph(); return; }
            activeBus = Number(id);
            Array.from(busListEl.children).forEach(x => x.classList.remove("active"));
            li.classList.add("active");
            drawGraph();
        };
        busListEl.appendChild(li);
    }
}

function clearActiveList() {
    Array.from(busListEl.children).forEach(x => x.classList.remove("active"));
}

function getNodeAtCanvasXY(mx, my) {
    computeOffsets();
    for (const id in positions) {
        const p = getPos(id);
        if (Math.hypot(mx - p.x, my - p.y) <= NODE_RADIUS) return id;
    }
    return null;
}

// hien thi dia diem
function showPopup(b) {
    const popup = document.getElementById("popup");
    const popupContent = document.getElementById("popupContent");

    popupContent.innerText = b.name;

    const canvasRect = canvas.getBoundingClientRect();

    popup.style.left = ( b.x + 370) + "px";
    popup.style.top = (b.y + 30) + "px";

    popup.classList.remove("hidden");
}

function hidePopup() {
    document.getElementById("popup").classList.add("hidden");
}

// chon node
canvas.addEventListener("mousemove", (ev) => {
    const r = canvas.getBoundingClientRect();
    const mx = ev.clientX - r.left;
    const my = ev.clientY - r.top;
    const found = getNodeAtCanvasXY(mx, my);
    if (found !== hoverNode) {
        hoverNode = found;
        drawGraph();
    }
});

canvas.addEventListener("click", (ev) => {
    const r = canvas.getBoundingClientRect();
    const mx = ev.clientX - r.left;
    const my = ev.clientY - r.top;
    const clickedNode = getNodeAtCanvasXY(mx, my);
    if (!clickedNode) return;

    if (selectedNodes.length === 0) {
        selectedNodes = [clickedNode];
    }
    else if (selectedNodes.length === 1) {
        if (clickedNode !== selectedNodes[0]) selectedNodes.push(clickedNode);
        else selectedNodes = [];
    }
    else {
        selectedNodes = [clickedNode];
    }

    // clear goi y khi chua chon 2 tram
    if (selectedNodes.length < 2) {
        highlightedShortest = [];
        shortestEl.textContent = "";
        busSuggestTitle.textContent = "";
        busSuggestEl.innerHTML = "";
        drawGraph();
        return;
    }

    // chon 2 tram -> chay thuat toan
    const a = selectedNodes[0];
    const b = selectedNodes[1];
    const res = dijkstra(a, b);

    if (!res || !res.path) {
        shortestEl.textContent = "Không tìm được đường đi.";
        highlightedShortest = [];
        busSuggestTitle.textContent = "";
        busSuggestEl.innerHTML = "";
        drawGraph();
        return;
    }

    // thong tin duong di
    highlightedShortest = res.path;
    shortestEl.textContent = `Đường đi: ${res.path.join(" -> ")} (${res.distance} km)`;

    // goi y tuyen xe
    const segs = suggestBusesForPath(res.path);
    busSuggestTitle.textContent = "Gợi ý bắt tuyến:";
    busSuggestEl.innerHTML = "";
    for (const s of segs) {
        const li = document.createElement("li");
        if (s.bus) {
            li.textContent = `Tuyến ${s.bus}: ${s.from} -> ${s.to}`;
        } else {
            li.textContent = `Không có tuyến trực tiếp: ${s.from} -> ${s.to}`;
        }
        busSuggestEl.appendChild(li);
    }

    drawGraph();
});

// hien thi danh sach va ban do
buildBusList();
drawGraph();

// hien dia diem
canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    for (let b of buildings) {
        let dx = mx - b.x;
        let dy = my - b.y;
        if (dx * dx + dy * dy < 30 * 30) {
            showPopup(b);
            return;
        }
    }

    hidePopup();
});
