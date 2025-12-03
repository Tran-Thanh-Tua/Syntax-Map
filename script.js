// -------- DỮ LIỆU ĐỒ THỊ --------
const graph = {
  "T01":[{to:"T02",w:6}],
  "T02":[{to:"T01",w:6},{to:"T04",w:4},{to:"T03",w:5},{to:"T05",w:8}],
  "T03":[{to:"T02",w:5}],
  "T04":[{to:"T02",w:4},{to:"T05",w:3}],
  "T05":[{to:"T02",w:8},{to:"T04",w:3}]
};

const busRoutes = {
  1:["T01","T02","T04"],
  2:["T03","T02","T05"],
  3:["T04","T05","T02"]
};

// -------- VỊ TRÍ VẼ NODES TRÊN CANVAS --------
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

// -------- MIN-HEAP (Priority Queue) --------
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

// -------- DIJKSTRA --------
function dijkstra(start,end){
  const dist={}, prev={};
  for(let v in graph) dist[v]=Infinity;
  dist[start]=0;
  const heap=new MinHeap();
  heap.push(start,0);

  while(!heap.isEmpty()){
    const {node,dist:d}=heap.pop();
    if(d>dist[node])continue;
    if(node===end)break;
    for(let e of graph[node]){
      const nd=d+e.w;
      if(nd<dist[e.to]){
        dist[e.to]=nd;
        prev[e.to]=node;
        heap.push(e.to,nd);
      }
    }
  }
  // truy vết path
  let path=[], cur=end;
  if(dist[cur]===Infinity) return null;
  while(cur){ path.push(cur); cur=prev[cur]; }
  return {path:path.reverse(),distance:dist[end]};
}

// -------- TÌM ROUTE COVER + GHÉP TUYẾN --------
function recommend(path){
  if(!path)return "Không có đường đi khả thi";
  const trip=[];
  let i=0;
  while(i<path.length){
    let bestBus=null, bestLen=0;
    for(let bus in busRoutes){
      const r=busRoutes[bus];
      for(let j=i;j<path.length;j++){
        const sub=path.slice(i,j+1);
        let ok=true;
        for(let k=0;k<sub.length-1;k++){
          const a=sub[k], b=sub[k+1];
          const ia=r.indexOf(a), ib=r.indexOf(b);
          if(ia===-1||ib===-1||Math.abs(ia-ib)!==1){ ok=false; break; }
        }
        if(ok && sub.length>bestLen){
          bestBus=bus;
          bestLen=sub.length;
        }
      }
    }
    if(!bestBus){
      i++;
    } else {
      const sub=path.slice(i,i+bestLen);
      trip.push({bus:parseInt(bestBus),from:sub[0],to:sub.at(-1)});
      i+=bestLen-1;
    }
  }
  if(trip.length===0) return "Không tuyến bus nào cover được đường đi";
  let text="Bạn nên đi:\n";
  for(let t of trip){
    text+=`- Tuyến ${t.bus}: ${t.from} → ${t.to}\n`;
  }
  return text.replace(/\n/g,"<br/>");
}

// -------- VẼ ĐỒ THỊ --------
function drawGraph(highlight=[]){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.lineWidth=1;
  // vẽ cạnh
  ctx.beginPath();
  for(let u in graph){
    for(let e of graph[u]){
      const v=e.to;
      if(positions[u]&&positions[v]){
        ctx.moveTo(positions[u].x,positions[u].y);
        ctx.lineTo(positions[v].x,positions[v].y);
      }
    }
  }
  ctx.stroke();

  // highlight thuộc tuyến bus đã được chọn
  ctx.lineWidth=4;
  for(let seg of highlight){
    const {bus,from,to}=seg;
    const r=busRoutes[bus];
    const i1=r.indexOf(from), i2=r.indexOf(to);
    if(i1!==-1&&i2!==-1){
      const step=(i2>i1)?1:-1;
      let k=i1;
      while(k!==i2){
        const a=r[k], b=r[k+step];
        ctx.beginPath();
        ctx.moveTo(positions[a].x,positions[a].y);
        ctx.lineTo(positions[b].x,positions[b].y);
        ctx.stroke();
        k+=step;
      }
    }
  }

  // vẽ nodes
  for(let v in positions){
    ctx.beginPath();
    ctx.arc(positions[v].x,positions[v].y,22,0,Math.PI*2);
    ctx.fillStyle="white";
    ctx.fill();
    ctx.strokeStyle="#000";
    ctx.stroke();
    ctx.fillStyle="#000";
    ctx.font="14px Arial";
    ctx.fillText(v, positions[v].x-15, positions[v].y+5);
  }
}

drawGraph();

// -------- CLICK CHỌN ĐỈNH --------
canvas.addEventListener("click",evt=>{
  const r=canvas.getBoundingClientRect();
  const mx=evt.clientX-r.left, my=evt.clientY-r.top;
  for(let v in positions){
    const {x,y}=positions[v];
    if(Math.hypot(mx-x,my-y)<=22){
      selected.push(v);
      ctx.beginPath();
      ctx.arc(x,y,24,0,Math.PI*2);
      ctx.lineWidth=3;
      ctx.stroke();
      if(selected.length===2){
        const {path,distance}=dijkstra(selected[0],selected[1])||{};
        const rec=recommend(path);
        document.getElementById("result").innerHTML=
          `🚏 ${selected[0]} → ${selected[1]}<br/>`+
          `📍 Path: ${path?path.join(" → "):"Không tìm được"}<br/>`+
          `📏 Distance: ${distance??"-"}<br/><br/>🚌 ${rec}`;
        selected=[];
        drawGraph();
      }
      break;
    }
  }
});