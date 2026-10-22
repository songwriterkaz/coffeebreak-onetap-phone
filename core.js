'use strict';
const $=s=>document.querySelector(s),PFX='coffeebreak-dsim-v1-';
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302']},{urls:'stun:stun.cloudflare.com:3478'},{urls:'stun:global.stun.twilio.com:3478'}]};
const get=(k,d)=>{try{const v=localStorage.getItem('cbl_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},put=(k,v)=>{try{localStorage.setItem('cbl_'+k,JSON.stringify(v))}catch(e){}};
const norm=s=>{const m=String(s||'').match(/CB-?(\d{4})-?(\d{4})/i);return m?`CB-${m[1]}-${m[2]}`:null};
function myNum(){let me=get('num');if(!me){const a=new Uint32Array(2);crypto.getRandomValues(a);me=`CB-${1000+a[0]%9000}-${String(a[1]%10000).padStart(4,'0')}`;put('num',me)}return me}
const pid=n=>PFX+n.replace(/-/g,'');
const fromPid=p=>norm(String(p).slice(PFX.length).replace(/^CB(\d{4})(\d{4})$/,'CB-$1-$2'));
function say(t){try{if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=0.9;speechSynthesis.speak(u)}catch(e){}}
function buzz(p){try{navigator.vibrate&&navigator.vibrate(p||60)}catch(e){}}
function shareLink(me){const base=location.href.split('#')[0].split('?')[0];return base+'?add='+me}
let peer=null,ready=false,back=1000,onReady=()=>{},onCall=()=>{},onState=()=>{};
function startPeer(me){try{peer&&peer.destroy()}catch(e){}
 peer=new Peer(pid(me),{config:ICE,debug:0});
 peer.on('open',()=>{ready=true;back=1000;onState(true);onReady()});
 const again=()=>{ready=false;onState(false);setTimeout(()=>startPeer(me),back);back=Math.min(back*2,30000)};
 peer.on('disconnected',again);
 peer.on('error',e=>{if(e.type==='unavailable-id'){ready=false;onState(false);setTimeout(()=>startPeer(me),5000)}else if(e.type==='peer-unavailable'){window.onPeerMissing&&window.onPeerMissing()}else if(['network','server-error','socket-error','socket-closed'].includes(e.type))again()});
 peer.on('call',c=>onCall(c))}
async function mic(){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw new Error('This browser cannot use the microphone. Open the app in Chrome or Safari.');
 return navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false})}
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});
