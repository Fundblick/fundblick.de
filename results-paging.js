'use strict';
(function(root){
  if(!root||!root.document)return;
  const cards=document.querySelector('#cards');
  if(!cards)return;
  const PAGE_SIZE=24;
  const COPY={
    de:{more:'Weitere Ergebnisse laden',status:(shown,total)=>`${shown} von ${total} Ergebnissen angezeigt`},tr:{more:'Daha fazla sonuç yükle',status:(shown,total)=>`${total} sonuçtan ${shown} tanesi gösteriliyor`},ru:{more:'Показать ещё',status:(shown,total)=>`Показано ${shown} из ${total}`},ar:{more:'عرض المزيد من النتائج',status:(shown,total)=>`يتم عرض ${shown} من ${total}`},pl:{more:'Pokaż więcej wyników',status:(shown,total)=>`Wyświetlono ${shown} z ${total}`},ro:{more:'Încarcă mai multe rezultate',status:(shown,total)=>`Sunt afișate ${shown} din ${total}`},uk:{more:'Показати ще',status:(shown,total)=>`Показано ${shown} з ${total}`},en:{more:'Load more results',status:(shown,total)=>`Showing ${shown} of ${total} results`},it:{more:'Carica altri risultati',status:(shown,total)=>`Visualizzati ${shown} di ${total} risultati`},bg:{more:'Покажи още резултати',status:(shown,total)=>`Показани ${shown} от ${total}`},hr:{more:'Učitaj još rezultata',status:(shown,total)=>`Prikazano ${shown} od ${total}`},el:{more:'Φόρτωση περισσότερων αποτελεσμάτων',status:(shown,total)=>`Εμφανίζονται ${shown} από ${total}`},sr:{more:'Учитај још резултата',status:(shown,total)=>`Приказано ${shown} од ${total}`},es:{more:'Cargar más resultados',status:(shown,total)=>`Se muestran ${shown} de ${total} resultados`},fr:{more:'Afficher plus de résultats',status:(shown,total)=>`${shown} résultats affichés sur ${total}`},pt:{more:'Carregar mais resultados',status:(shown,total)=>`A mostrar ${shown} de ${total} resultados`},fa:{more:'نمایش نتایج بیشتر',status:(shown,total)=>`${shown} از ${total} نتیجه نمایش داده می‌شود`},sq:{more:'Shfaq më shumë rezultate',status:(shown,total)=>`Po shfaqen ${shown} nga ${total} rezultate`},'zh-Hans':{more:'加载更多结果',status:(shown,total)=>`已显示 ${shown}/${total} 个结果`},ku:{more:'Encamên din bar bike',status:(shown,total)=>`${shown} ji ${total} encaman tên nîşandan`}
  };
  let visible=PAGE_SIZE,scheduled=false,lastCount=-1;
  const wrapper=document.createElement('div');wrapper.className='results-pager';wrapper.hidden=true;
  const status=document.createElement('span');status.className='results-pager-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const button=document.createElement('button');button.type='button';button.className='results-pager-button';
  wrapper.append(status,button);cards.insertAdjacentElement('afterend',wrapper);
  const lang=()=>document.querySelector('#language')?.value||document.documentElement.lang||'de';
  const copy=()=>COPY[lang()]||COPY.en;
  function items(){return Array.from(cards.children);}
  function apply(reset=false){
    scheduled=false;
    const list=items(),total=list.length;
    if(reset||total!==lastCount){visible=PAGE_SIZE;lastCount=total;}
    const shown=Math.min(visible,total);
    list.forEach((item,index)=>{item.hidden=index>=shown;});
    wrapper.hidden=total<=PAGE_SIZE;
    status.textContent=copy().status(shown,total);
    button.textContent=copy().more;
    button.hidden=shown>=total;
    button.setAttribute('aria-label',copy().more);
  }
  function schedule(reset=false){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>apply(reset));}
  button.addEventListener('click',()=>{visible+=PAGE_SIZE;apply(false);const next=items()[visible-PAGE_SIZE];next?.scrollIntoView({block:'nearest'});});
  document.querySelector('#language')?.addEventListener('change',()=>queueMicrotask(()=>apply(false)));
  const observer=new MutationObserver(()=>schedule(true));observer.observe(cards,{childList:true});
  schedule(true);
  root.FundBlickResultsPaging={PAGE_SIZE,apply};
})(typeof window!=='undefined'?window:null);
