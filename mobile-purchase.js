/* BIG BROTHER — Purchase Recorder Mobile V1 */
(function(){
'use strict';

function isIOS(){
  const ua=navigator.userAgent||'';
  return /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform==='MacIntel' && Number(navigator.maxTouchPoints||0)>1);
}

function decimalPurchaseInput(input){
  if(!input || String(input.tagName||'').toLowerCase()!=='input')return false;
  if(input.readOnly || input.disabled)return false;

  const type=String(input.type||'text').toLowerCase();
  if(['date','time','datetime-local','month','week','checkbox','radio','file','range','hidden','button','submit','reset','search','email','url'].includes(type))return false;

  const mode=String(input.getAttribute('inputmode')||input.inputMode||'').toLowerCase();
  if(mode==='decimal')return true;

  const stepRaw=String(input.getAttribute('step')||'').trim().toLowerCase();
  if(stepRaw==='any')return true;
  if(stepRaw){
    const step=Number(stepRaw);
    if(Number.isFinite(step)&&step>0&&!Number.isInteger(step))return true;
  }

  const semantic=[
    input.id,
    input.name,
    input.className,
    input.getAttribute('aria-label'),
    input.getAttribute('placeholder'),
    input.parentElement?.querySelector?.('label')?.textContent
  ].filter(Boolean).join(' ').toLowerCase();

  return /(price|amount|cost|discount|qty|quantity|paid|payment|payable|total|purchase|value)/.test(semantic);
}

function patchPurchaseDecimal(input){
  if(!isIOS() || !decimalPurchaseInput(input))return;

  input.dataset.bbIosPurchaseDecimal='1';
  try{input.type='text'}catch(_){}
  input.setAttribute('inputmode','decimal');
  input.removeAttribute('pattern');
  input.setAttribute('autocapitalize','none');
  input.setAttribute('spellcheck','false');
}

function patchPurchaseDecimals(root=document){
  if(!isIOS())return;
  if(root.matches?.('input'))patchPurchaseDecimal(root);
  root.querySelectorAll?.('input').forEach(patchPurchaseDecimal);
}

function installPurchaseDecimalSupport(){
  if(!isIOS())return;

  patchPurchaseDecimals(document);

  document.addEventListener('input',event=>{
    const input=event.target;
    if(input?.dataset?.bbIosPurchaseDecimal!=='1')return;

    const raw=String(input.value||'');
    if(!raw.includes(','))return;

    const start=input.selectionStart;
    input.value=raw.replace(/,/g,'.');

    if(typeof start==='number'){
      try{input.setSelectionRange(start,start)}catch(_){}
    }
  },true);

  new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes||[]){
        if(node?.nodeType===1)patchPurchaseDecimals(node);
      }
    }
  }).observe(document.body,{childList:true,subtree:true});

  setTimeout(()=>patchPurchaseDecimals(document),100);
  setTimeout(()=>patchPurchaseDecimals(document),450);
  setTimeout(()=>patchPurchaseDecimals(document),1200);
}

function boot(){
  const page=document.querySelector('.page');
  if(!page)return;

  installPurchaseDecimalSupport();
  const cards=[...page.querySelectorAll(':scope > .card')];
  if(cards[0])cards[0].classList.add('bb-purchase-info');
  if(cards[1])cards[1].classList.add('bb-products');
  if(cards[2])cards[2].classList.add('bb-payment');
  if(cards[3])cards[3].classList.add('bb-note','bb-note-collapsed');

  const oldTop=document.querySelector('.top');
  const head=document.createElement('div');
  head.className='bb-mobile-head';
  head.innerHTML='<div><h1>Create Purchase</h1><p>BIG BROTHER · Purchase Recorder</p></div><div style="display:flex;align-items:center;gap:6px"><span id="bbPurchaseCurrency" style="display:inline-flex;align-items:center;min-height:32px;padding:0 9px;border-radius:999px;background:#eef6ff;color:#1768d5;font-size:10px;font-weight:900">USD</span><button type="button" class="secondary" id="bbPurchaseNew">New</button></div>';
  page.insertBefore(head,oldTop?oldTop.nextSibling:page.firstChild);
  const newMobile=head.querySelector('#bbPurchaseNew');
  if(newMobile)newMobile.onclick=()=>document.getElementById('newBtn')?.click();

  const currency=document.getElementById('currency');
  const currencyPill=document.getElementById('bbPurchaseCurrency');
  const syncCurrency=()=>{if(currencyPill&&currency)currencyPill.textContent=String(currency.value||'USD').toUpperCase()};
  syncCurrency();
  document.getElementById('client')?.addEventListener('change',()=>{setTimeout(syncCurrency,80);setTimeout(syncCurrency,350);setTimeout(syncCurrency,800)});

  const noteCard=cards[3];
  const noteTitle=noteCard?.querySelector('.section-title');
  if(noteTitle){noteTitle.setAttribute('role','button');noteTitle.setAttribute('tabindex','0');const toggle=()=>noteCard.classList.toggle('bb-note-collapsed');noteTitle.addEventListener('click',toggle);noteTitle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()}})}

  const clearBtn=document.getElementById('clearBtn');
  const saveBtn=document.getElementById('saveBtn');
  if(clearBtn&&saveBtn){const bar=document.createElement('div');bar.className='bb-mobile-actions';document.body.appendChild(bar);bar.appendChild(clearBtn);bar.appendChild(saveBtn)}

  const body=document.getElementById('itemsBody');
  const polishItems=()=>{if(!body)return;body.querySelectorAll(':scope > tr').forEach(tr=>{const empty=!!tr.querySelector('td[colspan]');tr.classList.toggle('bb-empty-item',empty)})};
  if(body){new MutationObserver(polishItems).observe(body,{childList:true,subtree:true});polishItems()}

  const product=document.getElementById('product');
  const addBtn=document.getElementById('addBtn');
  addBtn?.addEventListener('click',()=>{setTimeout(()=>{if(product&&!product.disabled)product.focus({preventScroll:true})},60)});

  // Keep the important action visible above mobile browser UI / keyboard changes.
  if(window.visualViewport){const adjust=()=>{const bar=document.querySelector('.bb-mobile-actions');if(!bar)return;const gap=Math.max(0,window.innerHeight-(visualViewport.height+visualViewport.offsetTop));bar.style.transform=gap>0?'translateY(-'+gap+'px)':''};visualViewport.addEventListener('resize',adjust);visualViewport.addEventListener('scroll',adjust)}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
