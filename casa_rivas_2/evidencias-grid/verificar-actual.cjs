/* QA no productivo: captura actual y pruebas E2E locales, sin navegación externa. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const root = __dirname;
const out = path.join(root, 'verificacion-actual');
const shotDir = path.join(out, 'capturas');
const url = process.env.QA_URL || 'http://127.0.0.1:4173';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const targets = [
 ['inicio-1440x900-full.png','index.html',1440,900], ['inicio-900x900-full.png','index.html',900,900], ['inicio-390x844-full.png','index.html',390,844],
 ['servicios-1440x900-full.png','servicios.html',1440,900], ['servicios-390x844-full.png','servicios.html',390,844],
 ['visitanos-1440x900-full.png','visitanos.html',1440,900], ['visitanos-390x844-full.png','visitanos.html',390,844],
];
const assertion = (condition, message) => { if (!condition) throw new Error(message); };
(async () => {
 fs.mkdirSync(shotDir,{recursive:true});
 const browser = await chromium.launch({executablePath:chrome,headless:true});
 const results={captures:[], navigation:[], functional:{}, computed:{}, consoleErrors:[], requestFailures:[]};
 // Same baseline capture conditions.
 for (const [name,file,width,height] of targets) {
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,colorScheme:'light',reducedMotion:'reduce',locale:'es-SV',timezoneId:'America/El_Salvador'});
  const page=await context.newPage();
  await page.goto(`${url}/${file}`,{waitUntil:'networkidle'});
  await page.addStyleTag({content:'*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}'});
  await page.evaluate(()=>document.querySelectorAll('[data-reveal]').forEach(e=>e.classList.add('is-visible')));
  const output=path.join(shotDir,name); await page.screenshot({path:output,fullPage:true,animations:'disabled'});
  results.captures.push({name,file,viewport:`${width}x${height}`}); await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,colorScheme:'light',locale:'es-SV',timezoneId:'America/El_Salvador'});
 const page=await context.newPage();
 page.on('console',m=>{if(m.type()==='error')results.consoleErrors.push(m.text())});
 page.on('requestfailed',r=>results.requestFailures.push({url:r.url(),failure:r.failure()?.errorText||''}));
 // Navigation: direct, local routes only.
 for (const file of ['index.html','servicios.html','visitanos.html']) { const res=await page.goto(`${url}/${file}`,{waitUntil:'networkidle'}); assertion(res&&res.status()===200,`navigation ${file}`); results.navigation.push({file,status:res.status(),title:await page.title()}); }
 await page.goto(`${url}/index.html`,{waitUntil:'networkidle'});
 assertion(await page.locator('.product-card').count()===10,'initial catalog renders 10 products');
 results.functional.initial={cards:await page.locator('.product-card').count(),status:await page.locator('#results-status').textContent()};
 await page.locator('#search-input').fill('16743'); await page.waitForTimeout(300);
 assertion(await page.locator('.product-card').count()===1,'search PID 16743');
 results.functional.search={cards:await page.locator('.product-card').count(),status:await page.locator('#results-status').textContent()};
 await page.locator('#filter-clear').click();
 await page.locator('#filter-sg').selectOption('REL');
 assertion(await page.locator('.product-card').count()===4,'category REL');
 results.functional.category={cards:await page.locator('.product-card').count(),badges:await page.locator('.product-badge').allTextContents()};
 await page.locator('#filter-imagen').check();
 assertion(await page.locator('.product-card').count()===4,'with-image filter');
 await page.locator('input[name="filter-web"][value="web"]').check();
 assertion(await page.locator('.product-card').count()===3,'web-only filter');
 results.functional.additionalFilters={withImageCards:4,webOnlyCards:await page.locator('.product-card').count()};
 await page.locator('#filter-clear').click();
 await page.locator('#filter-cod').fill('13-PRO1007'); await page.waitForTimeout(300);
 assertion(await page.locator('.product-card').count()===1,'code filter');
 results.functional.codeFilter={cards:await page.locator('.product-card').count(),status:await page.locator('#results-status').textContent()};
 await page.locator('#filter-clear').click();
 await page.locator('#filter-orden').selectOption('codigo');
 const codes=await page.locator('.product-meta span:nth-child(2) strong').allTextContents();
 assertion(JSON.stringify(codes)===JSON.stringify([...codes].sort((a,b)=>a.localeCompare(b))),'code order ascending');
 results.functional.order={codes};
 await page.locator('#per-page-select').selectOption('2');
 const firstPage=await page.locator('.product-card').first().getAttribute('data-pid');
 await page.getByRole('button',{name:'2',exact:true}).click();
 const secondPage=await page.locator('.product-card').first().getAttribute('data-pid');
 assertion(firstPage!==secondPage && await page.getByRole('button',{name:'2',exact:true}).getAttribute('aria-current')==='page','pagination page 2');
 results.functional.pagination={firstPage,secondPage,current:await page.getByRole('button',{name:'2',exact:true}).getAttribute('aria-current')};
 await page.locator('.btn-primary').first().click();
 assertion(await page.locator('#cart-count').textContent()==='1','cart add');
 await page.locator('#cart-toggle').click();
 assertion(await page.locator('#cart-drawer').getAttribute('aria-hidden')==='false','cart opens');
 await page.locator('[data-cart-inc]').click();
 assertion(await page.locator('#cart-count').textContent()==='2','cart increment');
 await page.locator('#cart-close').click();
 results.functional.cart={count:await page.locator('#cart-count').textContent(),drawerHidden:await page.locator('#cart-drawer').getAttribute('aria-hidden')};
 // Computed grid, sticky behavior, no inline style / runtime style tags, desktop overflow.
 await page.goto(`${url}/index.html`,{waitUntil:'networkidle'});
 results.computed=await page.evaluate(()=>{
  const b=document.body,m=document.querySelector('main'),h=document.querySelector('.site-header');
  const cs=e=>{const s=getComputedStyle(e);return {display:s.display,areas:s.gridTemplateAreas,rows:s.gridTemplateRows,columns:s.gridTemplateColumns,position:s.position}};
  const before=h.getBoundingClientRect().top; window.scrollTo(0,700); const after=h.getBoundingClientRect().top;
  return {body:cs(b),main:cs(m),headerTop:{before,after},inlineAttributes:document.querySelectorAll('[style]').length,styleElements:document.querySelectorAll('style').length,overflow:{scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,bodyScrollWidth:document.body.scrollWidth}};
 });
 assertion(results.computed.body.display==='grid' && results.computed.main.display==='grid','computed catalog grids');
 assertion(results.computed.headerTop.after===0,'sticky header after scroll');
 assertion(results.computed.inlineAttributes===0 && results.computed.styleElements===0,'no inline/runtime style nodes');
 assertion(results.computed.overflow.scrollWidth<=results.computed.overflow.clientWidth,'desktop horizontal overflow');
 await context.close();
 // Mobile menu and horizontal overflow on every route at 390px.
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,colorScheme:'light',locale:'es-SV',timezoneId:'America/El_Salvador'});
 const mp=await mobile.newPage(); await mp.goto(`${url}/index.html`,{waitUntil:'networkidle'});
 await mp.locator('#mobile-nav-toggle').click(); assertion(await mp.locator('body').evaluate(e=>e.classList.contains('nav-open')),'mobile menu opens');
 await mp.getByRole('link',{name:'Servicios',exact:true}).click(); await mp.waitForLoadState('networkidle'); assertion(mp.url().endsWith('/servicios.html'),'mobile internal navigation');
 results.functional.mobileMenu={url:mp.url(),menuOpen:await mp.locator('body').evaluate(e=>e.classList.contains('nav-open'))};
 results.functional.mobileOverflow=[];
 for (const file of ['index.html','servicios.html','visitanos.html']) { await mp.goto(`${url}/${file}`,{waitUntil:'networkidle'}); results.functional.mobileOverflow.push({file,...await mp.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,bodyScrollWidth:document.body.scrollWidth}))}); }
 assertion(results.functional.mobileOverflow.every(x=>x.scrollWidth<=x.clientWidth),'mobile horizontal overflow');
 await mobile.close(); await browser.close();
 fs.writeFileSync(path.join(out,'resultado-e2e.json'),JSON.stringify(results,null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
})().catch(async err=>{console.error(err.stack||err);process.exit(1)});
