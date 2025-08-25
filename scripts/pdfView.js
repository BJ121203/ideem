

    // Año
    document.getElementById('y').textContent = new Date().getFullYear();
    // Menú
    document.getElementById('btn-burger')?.addEventListener('click', ()=>{
      const m=document.getElementById('menu'); const o=m.classList.toggle('open');
      document.getElementById('btn-burger').setAttribute('aria-expanded', o?'true':'false');
    });

    // ====== VISOR PDF ======
    const PDF_BASE = "docs/";
    const modal = document.getElementById('pdfModal');
    const btnClose = document.getElementById('btnClose');
    const pdfWrap = document.getElementById('pdfWrap');
    const loader = document.getElementById('loader');
    const errorBox = document.getElementById('error');
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d', { alpha:false });
    const pageInfo = document.getElementById('pageInfo');
    let pdfDoc=null, pageNum=1, scale=1, baseFitScale=1, fitMode='width', renderTask=null;

    ['cut','copy','paste','contextmenu','dragstart','selectstart'].forEach(evt=>{
      modal.addEventListener(evt, e=>e.preventDefault());
      document.getElementById('guard').addEventListener(evt, e=>e.preventDefault());
    });
    document.addEventListener('keydown', e=>{
      const k=e.key.toLowerCase(); if((e.ctrlKey||e.metaKey)&&(k==='s'||k==='p')) e.preventDefault();
    });

    const waitPaint = () => new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const normalizeUrl = u => (/^https?:\/\//i.test(u) || u.startsWith("/")) ? u : (PDF_BASE + u);
    async function fetchPdfBuffer(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(`HTTP ${r.status}`); return await r.arrayBuffer(); }

    async function computeFitScale(){
      const page = await pdfDoc.getPage(pageNum);
      const vp1 = page.getViewport({ scale:1 });
      let w = pdfWrap.clientWidth || pdfWrap.getBoundingClientRect().width || window.innerWidth*0.9;
      w = Math.max(360, w - 20); baseFitScale = Math.min(4, Math.max(0.5, w/vp1.width));
      if (fitMode==='width') scale = baseFitScale;
    }
    async function renderPage(num){
      if(!pdfDoc) return;
      if(renderTask){ try{ renderTask.cancel(); }catch{} renderTask=null; }
      const page = await pdfDoc.getPage(num);
      const vp = page.getViewport({ scale });
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.style.width = Math.round(vp.width) + 'px';
      canvas.style.height = Math.round(vp.height) + 'px';
      canvas.width  = Math.round(vp.width * dpr);
      canvas.height = Math.round(vp.height * dpr);
      const ctxObj = { canvasContext: ctx, viewport: vp, transform: dpr!==1 ? [dpr,0,0,dpr,0,0] : undefined };
      renderTask = page.render(ctxObj);
      await renderTask.promise;
      pageInfo.textContent = `${num} / ${pdfDoc.numPages}`;
    }

    async function openPdfViewer(file){
      if(!window.pdfjsLib){ alert('PDF.js no está disponible. Asegúrate de tener scripts/pdfjs/pdf.mjs y pdf.worker.mjs'); return; }
      const url = normalizeUrl(file);
      modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
      loader.style.display='flex'; errorBox.style.display='none'; canvas.style.display='none';
      for(let i=0;i<2;i++) await waitPaint();
      try{
        const data = await fetchPdfBuffer(url);
        const task = pdfjsLib.getDocument({ data, enableScripting:false, enableXfa:false });
        pdfDoc = await task.promise; pageNum=1;
        await computeFitScale(); await renderPage(pageNum);
        canvas.style.display='block';
      }catch(err){
        console.error(err); errorBox.style.display='flex'; errorBox.textContent='No se pudo cargar el PDF ('+err.message+')';
      }finally{ loader.style.display='none'; }
    }
    function closePdfViewer(){
      modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow='';
      if(renderTask){ try{ renderTask.cancel(); }catch{} renderTask=null; } pdfDoc=null; ctx.clearRect(0,0,canvas.width,canvas.height);
    }

    // Controles
    document.getElementById('prevPage').addEventListener('click', async ()=>{ if(pdfDoc && pageNum>1){ pageNum--; await renderPage(pageNum);} });
    document.getElementById('nextPage').addEventListener('click', async ()=>{ if(pdfDoc && pageNum<pdfDoc.numPages){ pageNum++; await renderPage(pageNum);} });
    document.getElementById('zoomIn').addEventListener('click', async ()=>{ if(pdfDoc){ fitMode='custom'; scale=Math.min(scale+0.15,4); await renderPage(pageNum);} });
    document.getElementById('zoomOut').addEventListener('click', async ()=>{ if(pdfDoc){ fitMode='custom'; scale=Math.max(scale-0.15,.5); await renderPage(pageNum);} });
    btnClose.addEventListener('click', closePdfViewer);
    modal.addEventListener('click', e=>{ if(e.target===modal) closePdfViewer(); });
    let t; window.addEventListener('resize', async ()=>{ if(pdfDoc){ clearTimeout(t); t=setTimeout(async ()=>{ await computeFitScale(); await renderPage(pageNum); },150);} });

    // Enlaces
    document.querySelectorAll('.open-pdf').forEach(b=>{
      b.addEventListener('click', e=>{ e.preventDefault(); const f=b.getAttribute('data-pdf'); if(f) openPdfViewer(f); });
    });
