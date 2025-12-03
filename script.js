console.log("✅ script.js đã chạy");

// -------- ĐỒ THỊ VÔ HƯỚNG + TRỌNG SỐ HỢP LỆ --------
const graph = {
  "T01":[{to:"T02",w:6}],
  "T02":[{to:"T01",w:6},{to:"T04",w:4},{to:"T03",w:5},{to:"T05",w:8}],
  "T03":[{to:"T02",w:5}],
  "T04":[{to:"T02",w:4},{to:"T05",w:3}],
  "T05":[{to:"T02",w:8},{to:"T04",w:3}]
};

// -------- 3 TUYẾN BUS (đáp ứng 2 chiều tự động) --------
const busRoutes = {
  1:["T01","T02","T04"],
  2:["T03","T02","T05"],
  3:["T04","T05","T02"]
};

// -------- VỊ TRÍ CỐ ĐỊNH VẼ NODES --------
const positions = {
  "T01":{x:100,y:200},
  "T02":{x:350,y:80},
  "T03":{x:250,y:350},
  "T04":{x:600,y:180},
  "T05":{x:500,y:360}
};

const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
let selected=[];

// -------- HÀNG ĐỢI ƯU TIÊN BẰNG MIN HEAP --------
class MinHeap {
  constructor(){ this.h=[]; }
  push(node,dist){
    this.h.push({node,dist});
    let i=this.h.length-1;
    while(i>0){
      let p=(i-1)>>1;
      if(this.h[p].dist<=this.h[i].dist)break;
      [this.h[p],this.h[i]]=[this.h[i],this.h[p]];
      i=p;
    }
  }
  pop(){
    if(this.h.length===0) return null;
    const top=this.h[0];
    const end=this.h.pop();
    if(this.h.length>0){
      this.h[0]=end;
      let i=0;
      while(true){
        let L=i*2+1, R=i*2+2, S=i;
        if(L<this.h.length&&this.h[L].dist<this.h[S].dist)S=L;
        if(R<this.h.length&&this.h[R].dist<this.h[S].dist)S=R;
        if(S===i)break;
        [this.h[i],this.h[S]]=[this.h[S],this.h[i]];
        i=S;
      }
    }
    return top;
  }
  isEmpty(){return this.h.length===0;}
}

// -------- DIJKSTRA TRẢ VỀ PATH + TỔNG TRỌNG SỐ --------
function dijkstra(start,end){
  const dist={}, prev={};
  for(let v in graph) dist[v]=Infinity;
  dist[start]=0;
  const heap=new MinHeap();
  heap.push(start,0);

  while(!heap.isEmpty()){
    const item = heap.pop();
    if(!item) break;
    const u = item.node;
    const d = item.dist;
    if(d > dist[u]) continue;
    if(u === end) break;
    for(let e of graph[u]){
      const v = e.to;
      const nd = dist[u] + e.w;
      if(nd < dist[v]){
        dist[v] = nd;
        prev[v] = u;
        heap.push(v, nd);
      }
    }
  }
  if(dist[end] === Infinity) return null;
  let path=[], cur=end;
  while(cur){ path.push(cur); cur=prev[cur]; }
  return {path:path.reverse(),distance:dist[end]};
}

// -------- HÀM GỢI Ý TUYẾN BUS KHÔNG CRASH --------
function recommend(path){
  if(!path || path.length < 2) return "⚠ Không đủ dữ liệu để gợi ý";

  const segs = [];
  let i = 0;
  while(i < path.length){
    let found = false;
    for(let busKey in busRoutes){
      const route = busRoutes[busKey];
      for(let j = i+1; j < path.length; j++){
        const sub = path.slice(i, j+1);
        let ok = true;
        for(let k=0; k < sub.length-1; k++){
          const a = sub[k], b = sub[k+1];
          const ia = route.indexOf(a), ib = route.indexOf(b);
          if(ia === -1 || ib === -1 || Math.abs(ia - ib) !== 1){
            ok = false;
            break;
          }
        }
        if(ok){
          segs.push({bus: Number(busKey), from:sub[0], to:sub.at(-1)});
          i = j;
          found = true;
          foundBreak = true;
          break;
        }
      }
      if(found) break;
    }
    if(!found) i++;
  }

  if(segs.length === 0) return "⚠ Không có tuyến bus nào phù hợp";

  let text="🚌 Gợi ý tuyến xe:<br/>";
  for(let s of segs){
    text += `- Tuyến ${s.bus}: ${s.from} → ${s.to}<br/>`;
  }
  return text;
}

// -------- VẼ GRAPH CHẮC CHẮN CHẠY --------
function drawGraph(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.beginPath();
  for(let u in graph){
    for(let e of graph[u]){
      const v = e.to;
      if(positions[u] && positions[v]){
        ctx.moveTo(positions[u].x, positions[u].y);
        ctx.lineTo(positions[v].x, positions[v].y);
      }
    }
  }
  ctx.stroke();

  for(let v in positions){
    ctx.beginPath();
    ctx.arc(positions[v].x, positions[v].y, 20, 0, Math.PI*2);
    ctx.fillStyle="white";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle="black";
    ctx.fillText(v, positions[v].x-15, positions[v].y+5);
  }
}

drawGraph();

function highlightRoute(busId){
  const route = busRoutes[busId];
  if(!route) return;

  // vẽ lại graph nền
  drawGraph();

  ctx.lineWidth = 4;
  ctx.beginPath();

  // vẽ từng cạnh liên tiếp trong tuyến
  for(let i = 0; i < route.length - 1; i++){
    const a = route[i], b = route[i+1];
    const pa = positions[a], pb = positions[b];
    if(pa && pb){
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
  }
  ctx.stroke();
}

// -------- CLICK CHỌN 2 ĐỈNH TRÊN CANVAS --------
canvas.addEventListener("click",evt=>{
  const r = canvas.getBoundingClientRect();
  const mx = evt.clientX - r.left;
  const my = evt.clientY - r.top;
  for(let v in positions){
    const {x,y} = positions[v];
    if(Math.hypot(mx-x, my-y) <= 20){
      selected.push(v);
      if(selected.length === 2){
        const d = dijkstra(selected[0], selected[1]);
        document.getElementById("result").innerHTML =
           d ? `📏 Đường đi: ${d.path.join(" → ")} (tổng dài: ${d.distance})<br/><br/>${recommend(d.path)}`
             : "❌ Không tìm được đường!";
        selected=[];
        drawGraph();
      }
      break;
    }
  }
});

// tạo list tuyến bên trái
const busList = document.getElementById("busList");
for(let busId in busRoutes){
  const li = document.createElement("li");
  li.textContent = `Tuyến ${busId}: ` + busRoutes[busId].join(" - ");
  li.onclick = () => highlightRoute(busId);
  busList.appendChild(li);
}
