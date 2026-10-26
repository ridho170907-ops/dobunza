(() => {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const status = document.getElementById('connection-status');
  const help = document.getElementById('connection-help');
  const dot = document.getElementById('status-dot');
  const createBtn = document.getElementById('create-room');
  const soloBtn = document.getElementById('play-solo');
  const joinBtn = document.getElementById('join-room');
  const copyBtn = document.getElementById('copy-code');
  const roomInput = document.getElementById('room-code');
  const roomDisplay = document.getElementById('room-display');
  const roomValue = document.getElementById('room-value');
  const canvasMessage = document.getElementById('canvas-message');
  const winOverlay = document.getElementById('win-overlay');
  const scoreEl = document.getElementById('score');
  const peerCount = document.getElementById('peer-count');
  const jumpBtn = document.getElementById('jump-button');
  const W = canvas.width, H = canvas.height;
  const keys = new Set();
  let peer = null, conn = null, isHost = false, isSolo = false, roomId = '', connected = false, gameStarted = false;
  let lastSend = 0, lastFrame = 0, animationTime = 0;
  const world = { hearts: [], collected: [], players: { one:{x:115,y:240,jumping:false}, two:{x:175,y:240,jumping:false} }, score:0, won:false };
  const me = {x:115,y:240,jumping:false,jumpUntil:0};
  const obstacles = [
    {x:285,y:135,w:72,h:42,type:'bush'}, {x:470,y:300,w:76,h:44,type:'rock'},
    {x:650,y:145,w:82,h:42,type:'bush'}, {x:790,y:325,w:70,h:42,type:'rock'},
    {x:390,y:390,w:72,h:38,type:'bush'}
  ];
  const colors = {one:'#c77f9b',two:'#9385c6'};
  // Endless-style side-scrolling runner used in solo mode.
  const runner = {distance:0, speed:235, y:0, vy:0, grounded:true, failed:false, finished:false, finishAt:4700, playerX:165, invulnerable:false};
  const runnerObstacles = [
    {x:520,w:42,h:44,type:'bush'}, {x:860,w:48,h:52,type:'crystal'},
    {x:1180,w:66,h:38,type:'mushroom'}, {x:1510,w:46,h:55,type:'stump'},
    {x:1850,w:70,h:42,type:'double'}, {x:2210,w:48,h:52,type:'crystal'},
    {x:2540,w:66,h:38,type:'mushroom'}, {x:2890,w:52,h:54,type:'stump'},
    {x:3240,w:72,h:44,type:'double'}, {x:3590,w:48,h:52,type:'crystal'},
    {x:3920,w:66,h:40,type:'mushroom'}, {x:4230,w:50,h:54,type:'stump'}
  ];
  const groundY = 386;
  let failOverlay = document.getElementById('fail-overlay');
  if(!failOverlay){failOverlay=document.createElement('div');failOverlay.id='fail-overlay';failOverlay.className='win-overlay';failOverlay.hidden=true;failOverlay.innerHTML='<div class="win-card"><div>🌸 💫 🌸</div><h2>Ups, coba lagi!</h2><p>Kamu menabrak rintangan. Lompat tepat waktu dan kumpulkan hati sampai garis finis.</p><button class="btn btn-primary" id="runner-retry">Coba lagi ♡</button></div>';document.querySelector('.canvas-wrap').appendChild(failOverlay);}
  function resetRunner(){runner.distance=0;runner.speed=235;runner.y=0;runner.vy=0;runner.grounded=true;runner.failed=false;runner.finished=false;runner.invulnerable=false;me.x=runner.playerX;me.y=groundY;me.jumping=false;me.jumpUntil=0;world.collected=[];world.score=0;world.won=false;scoreEl.textContent='0';winOverlay.hidden=true;failOverlay.hidden=true;canvasMessage.hidden=true;makeHearts();}
  document.getElementById('runner-retry').addEventListener('click',resetRunner);

  const rand = (min,max) => min + Math.random()*(max-min);
  function makeHearts(){
    world.hearts=[]; world.collected=[];
    if(isSolo){
      // Hearts are spread along the full scrolling course, above the ground.
      for(let i=0;i<12;i++) world.hearts.push({id:i,x:330+i*365,y:groundY-62-(i%3)*24,phase:rand(0,Math.PI*2)});
    } else {
      for(let i=0;i<12;i++){let x,y,tries=0;do{x=rand(100,W-70);y=rand(65,H-60);tries++;}while(hitsObstacle(x,y)&&tries<80);world.hearts.push({id:i,x,y,phase:rand(0,Math.PI*2)});}
    }
    world.score=0;world.won=false;scoreEl.textContent='0';winOverlay.hidden=true;if(failOverlay)failOverlay.hidden=true;
  }
  function setStatus(title, detail, online=false){status.textContent=title;help.textContent=detail;dot.classList.toggle('online',online);}
  function showRoom(code){roomDisplay.hidden=false;roomValue.textContent=code;roomInput.value=code;copyBtn.disabled=false;}
  function beginGame(){isSolo=false;gameStarted=true;canvasMessage.hidden=true;makeHearts();me.x=isHost?115:175;me.y=240;world.players[isHost?'one':'two']={x:me.x,y:me.y,jumping:false};draw();}
  soloBtn.addEventListener('click',()=>{if(peer){try{peer.destroy();}catch(e){}peer=null;}conn=null;isSolo=true;isHost=true;connected=true;gameStarted=true;roomId='';createBtn.disabled=false;joinBtn.disabled=false;setStatus('Mode solo aktif ♡','Kamu bisa bermain sendiri. Kumpulkan 12 hati untuk menyelesaikan level.',true);peerCount.textContent='1 pemain · mode solo';roomDisplay.hidden=true;copyBtn.disabled=true;canvasMessage.hidden=true;me.x=115;me.y=240;world.players.one={x:me.x,y:me.y,jumping:false};world.players.two={x:175,y:240,jumping:false};me.jumping=false;me.jumpUntil=0;resetRunner();setStatus('Mode solo aktif ♡','Lari sejauh mungkin, lompat melewati rintangan, kumpulkan 12 hati, lalu capai finis.',true);draw();});
  function send(message){if(conn&&conn.open){try{conn.send(message);}catch(e){}}}
  function connectEvents(connection){conn=connection;conn.on('open',()=>{connected=true;setStatus('Terhubung! 💗','Kalian sudah berada di room yang sama. Saatnya mengumpulkan hati.',true);peerCount.textContent='2 pemain online';createBtn.disabled=true;joinBtn.disabled=true;beginGame();send({type:'hello',name:'guest'});});conn.on('data',handleMessage);conn.on('close',()=>{connected=false;setStatus('Koneksi terputus','Salah satu pemain keluar. Buat atau gabung room kembali.');peerCount.textContent='Pemain terputus';});conn.on('error',e=>{setStatus('Koneksi bermasalah',e?.type==='peer-unavailable'?'Room tidak ditemukan. Periksa kode room dan coba lagi.':'Coba buat room baru atau gabung kembali.');});}
  function setupPeer(id){if(!window.Peer){setStatus('Library game belum termuat','Periksa koneksi internet, lalu muat ulang halaman.');return null;}try{peer=new Peer(id||undefined);peer.on('error',e=>{if(e.type==='unavailable-id')setStatus('Kode room sudah dipakai','Buat room baru dengan kode lain.');else if(e.type==='network')setStatus('Jaringan bermasalah','Pastikan internet aktif dan coba lagi.');else setStatus('Tidak bisa tersambung',e.message||'Coba muat ulang halaman.');});peer.on('disconnected',()=>{if(peer&&!peer.destroyed)peer.reconnect();});peer.on('close',()=>{connected=false;});return peer;}catch(e){setStatus('Gagal memulai koneksi','Pastikan koneksi internet aktif.');return null;}}
  createBtn.addEventListener('click',()=>{if(peer)peer.destroy();isHost=true;connected=false;createBtn.disabled=true;setStatus('Membuat room…','Sedang menyiapkan kode room.');roomId=Math.random().toString(36).slice(2,8).toUpperCase();const id='dobunza-'+roomId.toLowerCase();const p=setupPeer(id);if(!p)return;p.on('open',()=>{showRoom(roomId);setStatus('Room siap!','Bagikan kode ini ke pasangan, lalu tunggu sampai terhubung.');peerCount.textContent='Menunggu pemain kedua';});p.on('connection',c=>{if(conn&&conn.open){c.close();return;}connectEvents(c);});});
  joinBtn.addEventListener('click',()=>{const code=roomInput.value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){setStatus('Masukkan kode room','Kode biasanya terdiri dari 6 karakter.');roomInput.focus();return;}if(peer)peer.destroy();isHost=false;roomId=code;setStatus('Mencari room…','Menghubungkan ke room pasanganmu.');const p=setupPeer();if(!p)return;p.on('open',()=>{connectEvents(p.connect('dobunza-'+code.toLowerCase(),{reliable:true}));});});
  copyBtn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(roomValue.textContent);copyBtn.textContent='Tersalin ✓';setTimeout(()=>copyBtn.textContent='Salin kode',1600);}catch(e){roomInput.select();document.execCommand('copy');copyBtn.textContent='Kode dipilih';}});
  document.getElementById('play-again').addEventListener('click',()=>{if(isSolo){resetRunner();}else if(isHost){makeHearts();world.players.one={x:115,y:240,jumping:false};world.players.two={x:175,y:240,jumping:false};me.x=115;me.y=240;me.jumping=false;me.jumpUntil=0;send({type:'reset',world});}else send({type:'request-reset'});winOverlay.hidden=true;});
  function handleMessage(msg){if(!msg||typeof msg!=='object')return;if(msg.type==='hello'&&isHost){send({type:'world',world});}else if(msg.type==='position'){world.players.two={x:clamp(msg.x,20,W-20),y:clamp(msg.y,20,H-20),jumping:!!msg.jumping};if(isHost){checkCollection(world.players.two);sendWorld();}}else if(msg.type==='world'&&!isHost&&msg.world){applyWorld(msg.world);}else if(msg.type==='collect'&&isHost){collect(msg.id);sendWorld();}else if(msg.type==='reset'&&!isHost&&msg.world){applyWorld(msg.world);me.x=175;me.y=240;me.jumping=false;me.jumpUntil=0;}else if(msg.type==='request-reset'&&isHost){makeHearts();world.players.one={x:115,y:240,jumping:false};world.players.two={x:175,y:240,jumping:false};me.x=115;me.y=240;me.jumping=false;me.jumpUntil=0;send({type:'reset',world});}else if(msg.type==='win'){world.won=true;winOverlay.hidden=false;}}
  function applyWorld(w){world.hearts=Array.isArray(w.hearts)?w.hearts:world.hearts;world.collected=Array.isArray(w.collected)?w.collected:[];world.players=w.players||world.players;world.score=Number(w.score)||0;world.won=!!w.won;scoreEl.textContent=world.score;if(world.won)winOverlay.hidden=false;}
  function sendWorld(){send({type:'world',world:{hearts:world.hearts,collected:world.collected,players:world.players,score:world.score,won:world.won}});}
  function startJump(){
    if(!gameStarted||!connected)return;
    if(isSolo){if(!runner.failed&&!runner.finished&&runner.grounded){runner.vy=-565;runner.grounded=false;me.jumping=true;}return;}
    if(performance.now()<me.jumpUntil)return;me.jumpUntil=performance.now()+720;me.jumping=true;const slot=isHost?'one':'two';world.players[slot].jumping=true;
  }
  if(jumpBtn){jumpBtn.addEventListener('pointerdown',e=>{e.preventDefault();startJump();});jumpBtn.addEventListener('click',e=>{e.preventDefault();startJump();});}
  function collect(id){if(world.collected.includes(id)||world.won)return;world.collected.push(id);world.score=world.collected.length;scoreEl.textContent=world.score;if(world.score>=12){world.won=true;winOverlay.hidden=false;send({type:'win'});} }
  function checkCollection(pos){for(const h of world.hearts){if(!world.collected.includes(h.id)&&Math.hypot(pos.x-h.x,pos.y-h.y)<27)collect(h.id);}}
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function hitsObstacle(x,y){return obstacles.some(o=>x+10>o.x&&x-10<o.x+o.w&&y+10>o.y&&y-10<o.y+o.h);}
  function move(dt){if(!gameStarted||!connected)return;if(isSolo){moveRunner(dt);return;}const now=performance.now();me.jumping=now<me.jumpUntil;let dx=0,dy=0;if(keys.has('ArrowLeft')||keys.has('a'))dx--;if(keys.has('ArrowRight')||keys.has('d'))dx++;if(keys.has('ArrowUp')||keys.has('w'))dy--;if(keys.has('ArrowDown')||keys.has('s'))dy++;if(dx&&dy){dx*=.7071;dy*=.7071;}const speed=me.jumping?250:190;const nx=clamp(me.x+dx*speed*dt,22,W-22),ny=clamp(me.y+dy*speed*dt,28,H-24);if(me.jumping||!hitsObstacle(nx,me.y))me.x=nx;if(me.jumping||!hitsObstacle(me.x,ny))me.y=ny;const slot=isHost?'one':'two';world.players[slot]={x:me.x,y:me.y,jumping:me.jumping};if(isSolo){checkCollection(me);}else if(isHost){checkCollection(me);if(performance.now()-lastSend>90){lastSend=performance.now();sendWorld();}}else{if(performance.now()-lastSend>45){lastSend=performance.now();send({type:'position',x:me.x,y:me.y,jumping:me.jumping});}for(const h of world.hearts){if(!world.collected.includes(h.id)&&Math.hypot(me.x-h.x,me.y-h.y)<27){send({type:'collect',id:h.id});world.collected.push(h.id);}}}}
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k);if(k===' '||k==='spacebar')startJump();});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());document.querySelectorAll('[data-dir]').forEach(btn=>{const d=btn.dataset.dir;const k={up:'arrowup',down:'arrowdown',left:'arrowleft',right:'arrowright'}[d];const start=e=>{e.preventDefault();keys.add(k);};const stop=e=>{e.preventDefault();keys.delete(k);};btn.addEventListener('pointerdown',start);['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,stop));});
  function roundedRect(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();}
  function heartPath(x,y,size){ctx.save();ctx.translate(x,y);ctx.scale(size/18,size/18);ctx.beginPath();ctx.moveTo(0,7);ctx.bezierCurveTo(-20,-5,-10,-17,0,-8);ctx.bezierCurveTo(10,-17,20,-5,0,7);ctx.closePath();ctx.restore();}
  function drawHeart(x,y,size,color){ctx.save();ctx.translate(x,y);ctx.scale(size/18,size/18);ctx.beginPath();ctx.moveTo(0,8);ctx.bezierCurveTo(-20,-5,-10,-17,0,-8);ctx.bezierCurveTo(10,-17,20,-5,0,8);ctx.closePath();ctx.fillStyle=color;ctx.shadowColor=color;ctx.shadowBlur=12;ctx.fill();ctx.restore();}
  function drawPlayer(p,color,offset){const hop=p.jumping?Math.abs(Math.sin((performance.now()%720)/720*Math.PI))*32:0;ctx.save();ctx.translate(p.x,p.y+Math.sin(animationTime*5+offset)*1.7-hop);ctx.fillStyle='rgba(83,73,71,.12)';ctx.beginPath();ctx.ellipse(0,13,13,5,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=color;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff8f8';ctx.beginPath();ctx.arc(-4,-3,2,0,Math.PI*2);ctx.arc(4,-3,2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff8f8';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,1,4,.15,Math.PI-.15);ctx.stroke();ctx.fillStyle=color;ctx.beginPath();ctx.arc(-5,-12,4,0,Math.PI*2);ctx.arc(5,-12,4,0,Math.PI*2);ctx.fill();ctx.restore();}
  function draw(){if(isSolo){drawRunner();return;}ctx.clearRect(0,0,W,H);const grd=ctx.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#e8f2e5');grd.addColorStop(1,'#d7e9d2');ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<9;i++){ctx.beginPath();ctx.ellipse(i*130+30,30+(i%3)*14,70,23,0,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='rgba(111,157,105,.17)';ctx.lineWidth=2;for(let i=0;i<12;i++){const x=(i*83+17)%W,y=(i*47+30)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-8,y-12,x-14,y-14);ctx.moveTo(x,y);ctx.quadraticCurveTo(x+8,y-10,x+13,y-13);ctx.stroke();}for(let i=0;i<45;i++){const x=(i*173+31)%W,y=(i*79+18)%H;ctx.fillStyle=i%2?'rgba(255,255,255,.62)':'rgba(230,173,194,.62)';ctx.beginPath();ctx.arc(x,y,1.5+(i%3),0,Math.PI*2);ctx.fill();}
    // Natural obstacles: bushes and smooth stones. Jump to cross them.
    obstacles.forEach(o=>{if(o.type==='bush'){ctx.fillStyle='#9dbb91';ctx.beginPath();ctx.ellipse(o.x+22,o.y+27,24,17,0,0,Math.PI*2);ctx.ellipse(o.x+45,o.y+20,27,20,0,0,Math.PI*2);ctx.ellipse(o.x+o.w-8,o.y+29,19,14,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.34)';ctx.beginPath();ctx.arc(o.x+30,o.y+17,4,0,Math.PI*2);ctx.fill();}else{ctx.fillStyle='#b7b7a7';ctx.beginPath();ctx.ellipse(o.x+o.w/2,o.y+o.h/2+3,o.w/2,o.h/2,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d5d1c4';ctx.beginPath();ctx.ellipse(o.x+o.w/2-8,o.y+o.h/2-4,o.w/3,o.h/4,-.2,0,Math.PI*2);ctx.fill();}});
    world.hearts.forEach(h=>{if(world.collected.includes(h.id))return;const bob=Math.sin(animationTime*3+h.phase)*4;ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(h.x,h.y+bob,22,0,Math.PI*2);ctx.fill();drawHeart(h.x,h.y+bob,18,'#e99ab8');});
    // Tiny stepping stones and a winding path
    ctx.strokeStyle='rgba(249,242,224,.78)';ctx.lineWidth=40;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-20,H*.72);ctx.bezierCurveTo(W*.25,H*.58,W*.36,H*.88,W*.54,H*.68);ctx.bezierCurveTo(W*.72,H*.48,W*.77,H*.78,W+20,H*.58);ctx.stroke();ctx.strokeStyle='rgba(202,187,158,.18)';ctx.lineWidth=2;ctx.stroke();
    drawPlayer(world.players.one,colors.one,0);drawPlayer(world.players.two,colors.two,2);ctx.fillStyle='rgba(81,70,70,.65)';ctx.font='700 11px Manrope';ctx.textAlign='center';ctx.fillText('Ridho',world.players.one.x,world.players.one.y-23);ctx.fillText('Bunga',world.players.two.x,world.players.two.y-23);
    ctx.textAlign='left';ctx.fillStyle='rgba(255,255,255,.65)';roundedRect(18,16,180,29,12,'rgba(255,255,255,.58)');ctx.fillStyle='#8e9e84';ctx.font='800 10px Manrope';ctx.fillText('OUR LITTLE MEADOW  ✦',29,35);ctx.textAlign='right';ctx.fillStyle='rgba(81,70,70,.68)';ctx.font='700 10px Manrope';ctx.fillText('SPACE / JUMP BUTTON  ↟',W-22,35);
  }

  function moveRunner(dt){
    if(runner.failed||runner.finished)return;
    runner.distance += runner.speed*dt;
    runner.speed = Math.min(310,235+runner.distance*.012);
    if(!runner.grounded){runner.vy+=1450*dt;runner.y+=runner.vy*dt;if(runner.y>=0){runner.y=0;runner.vy=0;runner.grounded=true;me.jumping=false;}}
    // Collision is checked against the player's feet and obstacle hitbox.
    for(const o of runnerObstacles){
      const sx=o.x-runner.distance+runner.playerX;
      if(sx<runner.playerX+34&&sx+o.w>runner.playerX-23){
        if(runner.y>-25){runner.failed=true;failOverlay.hidden=false;setStatus('Petualangan terhenti','Kamu menabrak rintangan. Tekan Coba lagi untuk memulai ulang.');peerCount.textContent='Coba lagi untuk melanjutkan';return;}
      }
    }
    for(const h of world.hearts){
      if(!world.collected.includes(h.id)){
        const sx=h.x-runner.distance+runner.playerX;
        const hy=groundY-48-h.yOffset||h.y;
        const playerCenterY=groundY-29+runner.y;
        if(Math.abs(sx-runner.playerX)<29&&Math.abs((h.y||groundY-75)-playerCenterY)<47){world.collected.push(h.id);world.score=world.collected.length;scoreEl.textContent=world.score;}
      }
    }
    if(runner.distance>=runner.finishAt){
      runner.finished=true;
      if(world.score>=12){world.won=true;winOverlay.hidden=false;setStatus('Finis tercapai! 💗','Kamu berhasil mengumpulkan semua hati dan sampai di garis finis.',true);peerCount.textContent='Petualangan selesai · '+world.score+' hati';}
      else {runner.failed=true;failOverlay.querySelector('h2').textContent='Hampir sampai!';failOverlay.querySelector('p').textContent='Kamu mencapai finis, tetapi belum mengumpulkan 12 hati. Coba lagi dan kumpulkan semuanya!';failOverlay.hidden=false;setStatus('Hati belum lengkap','Kumpulkan semua 12 hati sebelum mencapai finis.');}
    }
  }
  function drawRunner(){
    ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#dceafa');sky.addColorStop(.63,'#f7e7ed');sky.addColorStop(1,'#e7efd9');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // distant hills with parallax
    for(let layer=0;layer<3;layer++){
      const parallax=runner.distance*(.10+layer*.10), base=285+layer*32, amp=30+layer*12;
      ctx.fillStyle=['#c8d9d2','#adc9ae','#91b58f'][layer];ctx.beginPath();ctx.moveTo(0,H);
      for(let x=-100;x<=W+100;x+=20){const wx=x+parallax;const y=base+Math.sin(wx*.008+layer)*amp+Math.sin(wx*.018)*amp*.35;ctx.lineTo(x,y);}
      ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    }
    // clouds drift slowly
    for(let i=0;i<5;i++){const x=((i*245-runner.distance*.12)%(W+180)+W+180)%(W+180)-70;const y=55+(i%3)*35;ctx.fillStyle='rgba(255,255,255,.68)';ctx.beginPath();ctx.ellipse(x,y,39,13,0,0,Math.PI*2);ctx.ellipse(x+23,y-8,25,17,0,0,Math.PI*2);ctx.ellipse(x+47,y,32,12,0,0,Math.PI*2);ctx.fill();}
    // ground and dotted path
    ctx.fillStyle='#7eaa7c';ctx.fillRect(0,groundY,W,H-groundY);
    ctx.fillStyle='#9bc28e';ctx.fillRect(0,groundY,W,12);
    ctx.fillStyle='#e5d7bc';ctx.fillRect(0,groundY+12,W,5);
    for(let i=0;i<28;i++){const x=((i*51-runner.distance*1.2)%(W+50)+W+50)%(W+50)-20;ctx.fillStyle=i%2?'rgba(255,255,255,.35)':'rgba(66,126,77,.22)';ctx.beginPath();ctx.ellipse(x,groundY+33+(i%3)*14,4,2,0,0,Math.PI*2);ctx.fill();}
    // decorative flowers repeat across the scrolling ground
    for(let i=0;i<30;i++){const x=((i*97-runner.distance*.8)%(W+100)+W+100)%(W+100)-40;const y=groundY+18+(i%4)*19;ctx.strokeStyle='#578c61';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+10);ctx.lineTo(x,y-2);ctx.stroke();ctx.fillStyle=i%2?'#f4b7cd':'#fff0f4';for(let a=0;a<5;a++){ctx.beginPath();ctx.arc(x+Math.cos(a*1.256)*4,y-4+Math.sin(a*1.256)*4,3,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#f1d27b';ctx.beginPath();ctx.arc(x,y-4,2,0,Math.PI*2);ctx.fill();}
    // obstacles with distinct silhouettes
    runnerObstacles.forEach(o=>{const x=o.x-runner.distance+runner.playerX;if(x<-100||x>W+100)return;
      if(o.type==='bush'||o.type==='double'){ctx.fillStyle='#4f8b61';ctx.beginPath();ctx.arc(x+12,groundY-12,18,0,Math.PI*2);ctx.arc(x+31,groundY-20,23,0,Math.PI*2);ctx.arc(x+49,groundY-11,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#80b77d';ctx.beginPath();ctx.arc(x+24,groundY-27,6,0,Math.PI*2);ctx.arc(x+43,groundY-13,5,0,Math.PI*2);ctx.fill();if(o.type==='double'){ctx.fillStyle='#4f8b61';ctx.beginPath();ctx.arc(x+o.w+10,groundY-12,18,0,Math.PI*2);ctx.fill();}}
      else if(o.type==='crystal'){ctx.fillStyle='#a28ad4';ctx.beginPath();ctx.moveTo(x+o.w/2,groundY-o.h);ctx.lineTo(x+o.w,groundY-12);ctx.lineTo(x+o.w/2,groundY);ctx.lineTo(x,groundY-12);ctx.closePath();ctx.fill();ctx.fillStyle='#d9cafa';ctx.beginPath();ctx.moveTo(x+o.w/2,groundY-o.h+8);ctx.lineTo(x+o.w/2+7,groundY-13);ctx.lineTo(x+o.w/2,groundY-5);ctx.closePath();ctx.fill();}
      else if(o.type==='mushroom'){ctx.fillStyle='#f0d7b8';ctx.fillRect(x+o.w*.35,groundY-25,o.w*.3,25);ctx.fillStyle='#d87991';ctx.beginPath();ctx.ellipse(x+o.w/2,groundY-27,o.w/2,17,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#fff0f4';ctx.beginPath();ctx.arc(x+20,groundY-34,4,0,Math.PI*2);ctx.arc(x+o.w-19,groundY-33,4,0,Math.PI*2);ctx.fill();}
      else {ctx.fillStyle='#a76f54';ctx.fillRect(x+8,groundY-33,o.w-16,33);ctx.fillStyle='#c58e6e';ctx.beginPath();ctx.ellipse(x+o.w/2,groundY-33,o.w/2-7,7,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e6b89b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+o.w/2,groundY-33,4,0,Math.PI*2);ctx.stroke();}
    });
    // hearts on the long course
    world.hearts.forEach(h=>{if(world.collected.includes(h.id))return;const x=h.x-runner.distance+runner.playerX;if(x<-40||x>W+40)return;const y=(h.y||groundY-80)+Math.sin(animationTime*4+h.phase)*5;ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.fill();drawHeart(x,y,19,'#e879a6');});
    // finish arch becomes visible near the end
    const fx=runner.finishAt-runner.distance+runner.playerX;
    if(fx<W+120){ctx.fillStyle='#f8f0e9';ctx.fillRect(fx,groundY-115,12,115);ctx.fillRect(fx+92,groundY-115,12,115);ctx.fillStyle='#c77f9b';ctx.fillRect(fx-8,groundY-130,128,26);ctx.fillStyle='#fff';ctx.font='800 13px Manrope';ctx.textAlign='center';ctx.fillText('FINISH ♡',fx+56,groundY-113);for(let i=0;i<6;i++){ctx.fillStyle=i%2?'#fff':'#c77f9b';ctx.fillRect(fx+12+i*13,groundY-12,13,12);}}
    // player shadow and cute bunny mascot
    const py=groundY-28+runner.y;
    ctx.fillStyle='rgba(49,83,54,.22)';ctx.beginPath();ctx.ellipse(runner.playerX,groundY+3,runner.grounded?18:12,5,0,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(runner.playerX,py+Math.sin(animationTime*13)*(runner.grounded?1.5:0));
    ctx.fillStyle='#c77f9b';ctx.beginPath();ctx.ellipse(-8,-27,6,14,-.22,0,Math.PI*2);ctx.ellipse(7,-28,6,15,.2,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#f7dce5';ctx.beginPath();ctx.arc(0,-8,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c77f9b';ctx.beginPath();ctx.arc(-7,-10,2.4,0,Math.PI*2);ctx.arc(7,-10,2.4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#c77f9b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-5,5,.2,Math.PI-.2);ctx.stroke();ctx.fillStyle='#e879a6';ctx.beginPath();ctx.arc(-12,-4,4,0,Math.PI*2);ctx.arc(12,-4,4,0,Math.PI*2);ctx.fill();ctx.restore();
    // compact runner HUD
    ctx.fillStyle='rgba(255,255,255,.72)';roundedRect(18,16,245,48,14,'rgba(255,255,255,.72)');ctx.textAlign='left';ctx.fillStyle='#67565c';ctx.font='800 11px Manrope';ctx.fillText('OUR LITTLE ADVENTURE',31,34);ctx.fillStyle='#9b7b8a';ctx.font='700 10px Manrope';ctx.fillText('JUMP • COLLECT • REACH THE FINISH',31,51);
    const progress=Math.min(1,runner.distance/runner.finishAt);ctx.fillStyle='rgba(255,255,255,.65)';roundedRect(W-225,18,207,36,12,'rgba(255,255,255,.65)');ctx.fillStyle='#8a6d79';ctx.font='700 10px Manrope';ctx.textAlign='left';ctx.fillText('JARAK KE FINIS',W-212,31);ctx.fillStyle='#ead4df';roundedRect(W-212,37,180,7,4,'#ead4df');roundedRect(W-212,37,180*progress,7,4,'#c77f9b');
    if(runner.failed||runner.finished){ctx.fillStyle='rgba(81,70,70,.16)';ctx.fillRect(0,0,W,H);}
  }
  function loop(t){const dt=Math.min(.04,(t-lastFrame)/1000||0);lastFrame=t;animationTime=t/1000;move(dt);draw();requestAnimationFrame(loop);}makeHearts();requestAnimationFrame(loop);
})();
