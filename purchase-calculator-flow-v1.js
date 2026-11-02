/* BIG BROTHER · Calculator-style Purchase Product Picker · 02-Nov-2026.
   Uses purchase catalog already loaded by the existing approved RPC.
   Does not change stock source, promotion handling, discounts or payment RPC.
 */
(function(){
'use strict';
if(window.BBPurchaseCalculatorFlowV1)return;
const $=id=>document.getElementById(id);
const escapeHtml=v=>String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmtPrice=v=>Number(v||0).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:4});
let search, tiles, count, entry, selection, selectedName, selectedSub, listCount, help;
function list(){try{return Array.isArray(catalog)?catalog:[]}catch(_){return []}}
function cart(){try{return Array.isArray(items)?items:[]}catch(_){return []}}
function selectedCode(){return String($('product')?.value||'')}
function activeProduct(){return list().find(p=>String(p.productCode)===selectedCode())}
function blurSafe(el){try{el.blur()}catch(_){}}
function focusSafe(el){
 if(!el)return;
 try{el.focus({preventScroll:true})}catch(_){try{el.focus()}catch(_){}}
}
function renderProducts(){
 if(!tiles)return;
 const products=list();
 const query=String(search?.value||'').trim().toLocaleLowerCase();
 const shown=products.filter(p=>String(p.productName||'').toLocaleLowerCase().includes(query)||String(p.productCode||'').toLocaleLowerCase().includes(query));
 if(count)count.textContent=products.length ? (shown.length+' of '+products.length+' products'):'Select a supplier first';
 if(!products.length){
   tiles.innerHTML='<div class="bb-pick-empty">Select Client / Supplier above to load its product catalog.</div>';
   return;
 }
 if(!shown.length){
   tiles.innerHTML='<div class="bb-pick-empty">No matching products. Try a different name or product code.</div>';
   return;
 }
 const current=selectedCode();
 tiles.innerHTML=shown.map(p=>{
   const code=String(p.productCode||''),name=String(p.productName||code);
   return '<button type="button" class="bb-pick-tile'+(current===code?' active':'')+'" data-bb-product="'+escapeHtml(code)+'" aria-pressed="'+(current===code?'true':'false')+'" title="'+escapeHtml(name)+'">'+
    '<span class="bb-pick-name">'+escapeHtml(name)+'</span>'+
    '<span class="bb-pick-foot"><span>'+escapeHtml(code)+'</span><b>$'+fmtPrice(p.purchasePrice)+'</b></span></button>';
 }).join('');
}
function showSelection(){
 if(!entry||!selection)return;
 const p=activeProduct();
 const editing=Number.isInteger(window.bbPurchaseEditIndex)&&window.bbPurchaseEditIndex>=0;
 if(!p){
   entry.hidden=true;selection.hidden=true;
   entry.classList.remove('bb-editing');
   return;
 }
 entry.hidden=false;selection.hidden=false;
 entry.classList.toggle('bb-editing',editing);
 if(selectedName)selectedName.textContent=(editing?'Editing line #'+(window.bbPurchaseEditIndex+1)+' · ':'')+String(p.productName||'Product');
 if(selectedSub)selectedSub.textContent='Purchase Qty → Supplier Price → Enter to '+(editing?'save changes':'add line')+'. Promotion Qty is optional.';
 if(help)help.textContent=editing?'Editing an existing line; Cancel keeps that line unchanged.':'Same product can be added again as a separate purchase line, even at the same price.';
 if($('addBtn'))$('addBtn').textContent=editing?'Save Line Changes':'+ Add Line';
 renderProducts();
}
function choose(code){
 const selector=$('product');
 if(!selector||!list().some(p=>String(p.productCode)===String(code)))return;
 selector.value=String(code);
 if(typeof productChanged==='function')productChanged();
 else showSelection();
 focusSafe($('qty'));
 const qty=$('qty');
 try{qty?.select()}catch(_){}
}
function cancelEdit(){
 window.bbPurchaseEditIndex=-1;
 if(typeof clearProductEntry==='function')clearProductEntry(true);
 if(typeof renderItems==='function')renderItems();
 showSelection();renderProducts();
}
function afterAdd(){
 if(search)search.value='';
 showSelection();
 renderProducts();refreshCounts();
 // Desktop calculator rhythm: next click or type can choose the next product.
 if(!matchMedia('(pointer:coarse)').matches)focusSafe(search);
}
function startEdit(){
 if(!entry)return;
 showSelection();
 try{entry.scrollIntoView({block:'nearest',behavior:'smooth'})}catch(_){}
 focusSafe($('qty'));
 try{$('qty')?.select()}catch(_){}
}
function afterReset(){
 if(search)search.value='';
 showSelection();renderProducts();refreshCounts();
}
function refreshCounts(){
 if(listCount)listCount.textContent=cart().length+' line'+(cart().length===1?'':'s')+' · Duplicate products allowed';
}
function boot(){
 const host=document.querySelector('.addline');
 if(!host||$('bbPurchasePicker'))return;
 entry=host;entry.id='purchaseEntry';entry.classList.add('bb-purchase-entry');entry.hidden=true;
 const picker=document.createElement('div');picker.id='bbPurchasePicker';picker.className='bb-purchase-picker';
 picker.innerHTML='<div class="bb-pick-top"><strong>1 · Select a product</strong><small id="bbPurchaseProductCount">Select a supplier first</small></div>'+
 '<label class="bb-pick-search" aria-label="Search supplier products">'+
 '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="7.3"></circle><path d="m16.4 16.4 5 5"></path></svg>'+
 '<input type="search" id="bbPurchaseProductSearch" placeholder="Search products by name or code…" autocomplete="off" aria-label="Search products"></label>'+
 '<div id="bbPurchaseTiles" class="bb-pick-tiles" role="group" aria-label="Supplier products"></div>';
 host.before(picker);
 const strip=document.createElement('div');strip.id='bbPurchaseSelection';strip.className='bb-pick-selection';strip.hidden=true;
 strip.innerHTML='<div><strong id="bbPurchaseSelectedName"></strong><small id="bbPurchaseSelectedSub" style="display:block;margin-top:3px"></small></div><button type="button" id="bbPurchaseCancel">Cancel</button>';
 host.before(strip);
 const helper=document.createElement('div');helper.id='bbPurchaseEditHelp';helper.className='bb-purchase-help';
 helper.textContent='Same product can be added again as a separate purchase line.';
 host.after(helper);
 const table=host.parentElement?.querySelector('.tablewrap');
 if(table){
  const header=document.createElement('div');header.className='bb-purchase-list-title';
  header.innerHTML='<span>2 · Purchase lines</span><span id="bbPurchaseLineCount" class="bb-line-count">0 lines</span>';
  table.before(header);
 }
 search=$('bbPurchaseProductSearch');tiles=$('bbPurchaseTiles');count=$('bbPurchaseProductCount');
 selection=strip;selectedName=$('bbPurchaseSelectedName');selectedSub=$('bbPurchaseSelectedSub');
 listCount=$('bbPurchaseLineCount');help=helper;
 search.addEventListener('input',renderProducts);
 search.addEventListener('keydown',event=>{
  if(event.key!=='Enter')return;
  const visible=tiles.querySelectorAll('button[data-bb-product]');
  if(visible.length===1){event.preventDefault();choose(visible[0].dataset.bbProduct)}
 });
 tiles.addEventListener('click',event=>{
  const btn=event.target.closest('button[data-bb-product]');
  if(btn)choose(btn.dataset.bbProduct);
 });
 $('bbPurchaseCancel').addEventListener('click',cancelEdit);
 // Calculator shortcut: Enter on Qty -> Price, Enter on Price -> add/save.
 $('qty')?.addEventListener('keydown',event=>{
   if(event.key!=='Enter'||event.isComposing)return;
   event.preventDefault();focusSafe($('price'));try{$('price')?.select()}catch(_){}
 });
 $('price')?.addEventListener('keydown',event=>{
   if(event.key!=='Enter'||event.isComposing)return;
   event.preventDefault();$('addBtn')?.click();
 });
 $('promotionQty')?.addEventListener('keydown',event=>{
   if(event.key!=='Enter'||event.isComposing)return;
   event.preventDefault();focusSafe($('price'));try{$('price')?.select()}catch(_){}
 });
 renderProducts();refreshCounts();showSelection();
}
const api={renderProducts,showSelection,afterAdd,startEdit,afterReset,refreshCounts};
window.BBPurchaseCalculatorFlowV1=api;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();