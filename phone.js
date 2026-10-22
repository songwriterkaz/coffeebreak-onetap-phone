const me=myNum();$('#me').textContent=me;
let contacts=get('contacts',[]);const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const add=new URLSearchParams(location.search).get('add');const an=norm(add);
if(an&&an!==me&&!contacts.find(c=>c.n===an)){contacts.push({n:an,name:'Contact '+(contacts.length+1)});put('contacts',contacts);history.replaceState(null,'',location.pathname)}
const nameOf=n=>(contacts.find(c=>c.n===n)||{}).name||n;
const COL=['blue','','green','grey'];
function draw(){$('#contacts').innerHTML=contacts.slice(0,4).map((c,i)=>`<button class="big c ${COL[i%4]}" data-n="${c.n}" aria-label="Call ${esc(c.name)}">${esc(c.name)}</button>`).join('');
 document.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>dial(b.dataset.n))}
draw();
onState=ok=>{$('#st').textContent=ok?'Ready to call':'Connecting…';$('#st').style.color=ok?'#2ee66b':'#ffd84d'};
let first=!get('setup');onReady=()=>{if(first){first=false;put('setup',1);say('Your phone is ready. Tap a big button to call.')}};
startPeer(me);
const _sp=startPeer;
const _d=dial;
const showS=(id,on)=>$('#'+id).classList.toggle('hide',!on);
let dc=null,other=null,cur=null,stream=null,timer=null,pending=false;
function tidy(){const k=dc;dc=null;if(k)setTimeout(()=>{try{k.close()}catch(e){}},800);try{cur&&cur.close()}catch(e){}cur=null;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;clearInterval(timer);pending=false;showS('incall',0);showS('ring',0)}
function endCall(msg){tidy();if(msg){$('#err').textContent=msg;say(msg)}}
window.onPeerMissing=()=>{if(pending)endCall('They are not online right now.')};
function hook(c,who){cur=c;other=c.peer;setTimeout(()=>{const pc=c.peerConnection;if(pc)pc.addEventListener('iceconnectionstatechange',()=>{if(['disconnected','failed','closed'].includes(pc.iceConnectionState)&&cur===c)endCall(pending?'Could not connect.':'Call ended')})},500);c.on('stream',s=>{pending=false;const pc=c.peerConnection;if(pc){const chk=()=>{if(cur===c&&(['disconnected','failed','closed'].includes(pc.iceConnectionState)||['failed','closed','disconnected'].includes(pc.connectionState)))endCall('Call ended')};pc.addEventListener('iceconnectionstatechange',chk);pc.addEventListener('connectionstatechange',chk)}s.getTracks().forEach(tr=>tr.onended=()=>{if(cur===c)endCall('Call ended')});$('#aud').srcObject=s;$('#aud').play().catch(()=>{});let live=false;const talk=()=>{if(live||cur!==c)return;if(pc&&!['connected','completed'].includes(pc.iceConnectionState))return;live=true;$('#cwho').textContent='Talking to '+who;say('Connected');buzz(100);const t0=Date.now();timer=setInterval(()=>{const s2=Math.floor((Date.now()-t0)/1000);$('#ctime').textContent=Math.floor(s2/60)+':'+String(s2%60).padStart(2,'0')},1000)};if(pc)pc.addEventListener('iceconnectionstatechange',talk);talk();$('#cwho').textContent=live?$('#cwho').textContent:'Connecting to '+who;setTimeout(()=>{if(!live&&cur===c)endCall('Could not connect. The WiFi may be blocking calls.')},20000)});
 c.on('close',()=>endCall('Call ended'));c.on('error',()=>endCall('Call ended'))}
async function dial(n){buzz();$('#err').textContent='';if(!ready){say('Still connecting. Please wait.');$('#err').textContent='Still connecting. Please wait a moment.';return}
 const who=nameOf(n);try{stream=await mic()}catch(e){endCall('Please allow the microphone to make calls.');return}
 showS('incall',1);$('#cwho').textContent='Calling '+who;$('#ctime').textContent='';say('Calling '+who);pending=true;
 put("last",n);try{dc=peer.connect(pid(n),{reliable:true,serialization:'json'});dc.on('data',x=>{if(x==='bye'&&cur)endCall('Call ended')})}catch(e){}hook(peer.call(pid(n),stream,{metadata:{video:false}}),who);setTimeout(()=>{if(pending)endCall('No answer')},45000)}
let ringT;onCall=c=>{if(cur){c.close();return}const n=fromPid(c.peer)||'Unknown';const who=nameOf(n);showS('ring',1);$('#rwho').textContent=who+' is calling';
 buzz([400,200,400,200,400]);say(who+' is calling. Tap the big green button to answer.');clearInterval(ringT);ringT=setInterval(()=>buzz([400,200,400]),2500);
 $('#ans').onclick=async()=>{clearInterval(ringT);try{stream=await mic()}catch(e){c.close();endCall('Please allow the microphone to answer.');return}showS('ring',0);showS('incall',1);$('#cwho').textContent='Connecting to '+who;c.answer(stream);hook(c,who);
  if(!contacts.find(x=>x.n===n)&&norm(n)){contacts.push({n,name:'Contact '+(contacts.length+1)});put('contacts',contacts);draw()}};
 $('#dec').onclick=()=>{clearInterval(ringT);c.close();showS('ring',0)};
 c.on('close',()=>{clearInterval(ringT);showS('ring',0)})};
$('#hang').onclick=()=>{buzz();if(dc&&dc.open){try{dc.send('bye')}catch(e){}}endCall('Call ended')};
$('#call').onclick=()=>{buzz();if(contacts.length){dial(get('last',contacts[0].n))}else{showS('add',1);say('Type their Coffeebreak call ID, then tap save and call.');$('#anum').focus()}};
$('#asave').onclick=()=>{const n=norm($('#anum').value);if(!n){say('That call ID does not look right. It starts with C B.');return}const name=$('#aname').value.trim()||('Contact '+(contacts.length+1));
 if(!contacts.find(c=>c.n===n))contacts.push({n,name});put('contacts',contacts);put('last',n);draw();showS('add',0);dial(n)};
$('#acancel').onclick=()=>showS('add',0);
$('#helpb').onclick=()=>{buzz([200,100,200]);showS('help',1);say('Help. For an emergency tap the red button to open your dialler with triple zero. Or call your first contact.')};
$('#hback').onclick=()=>showS('help',0);
$('#hfam').onclick=()=>{showS('help',0);if(contacts.length)dial(contacts[0].n);else say('You have no contacts yet.')};
$('#share').onclick=async()=>{const u=shareLink(me);try{if(navigator.share){await navigator.share({title:'Coffeebreak call ID',text:'Call me over WiFi on Coffeebreak One-Tap Phone: '+me,url:u});return}}catch(e){if(e.name==='AbortError')return}try{await navigator.clipboard.writeText(u);say('Link copied')}catch(e){prompt('Copy your link',u)}};

setInterval(()=>{if(peer&&!peer._byeHook){peer._byeHook=1;peer.on('connection',d=>{d.on('data',x=>{if(x==='bye'&&cur&&d.peer===other)endCall('Call ended')});dc=d})}},300);
