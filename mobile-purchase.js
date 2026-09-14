/* BIG BROTHER — Purchase Recorder Mobile V1 */
(function(){
'use strict';
function boot(){
  const page=document.querySelector('.page');
  if(!page)return;
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
