<script>
setTimeout(async () => {
  const out = [], ok = (name, condition) => out.push((condition ? 'PASS ' : 'FAIL ') + name);
  const wait = () => new Promise(resolve => setTimeout(resolve, 60));
  const chain = $('signalChain'), toolbar = document.querySelector('header.topbar'), card = $('captureCard');
  let spacer;
  try {
    spacer = document.createElement('div'); spacer.style.height = '1800px';
    document.querySelector('main').appendChild(spacer);
    scrollTo(0, 0); await wait();
    const chainTop = chain.getBoundingClientRect().top, cardTop = card.getBoundingClientRect().top;
    ok('signal chain sits below toolbar', Math.abs(chainTop - toolbar.getBoundingClientRect().bottom - 18) < 1);
    scrollTo(0, 250); await wait();
    ok('window scrolls controls below chain', scrollY === 250 && Math.abs(card.getBoundingClientRect().top - cardTop + 250) < 1);
    ok('signal chain stays fixed while scrolling', Math.abs(chain.getBoundingClientRect().top - chainTop) < 1);
    ok('toolbar remains fixed', Math.abs(toolbar.getBoundingClientRect().top) < 1);
    ok('chain floats above scrolling highlights', Number(getComputedStyle(chain).zIndex) > 2);
    toolbar.style.paddingBottom = '40px'; window.dispatchEvent(new Event('resize')); await wait();
    ok('chain follows changing toolbar height', Math.abs(chain.getBoundingClientRect().top - toolbar.getBoundingClientRect().bottom - 18) < 1);
    toolbar.style.paddingBottom = ''; window.dispatchEvent(new Event('resize')); await wait();
    $('libraryOverlay').hidden = false;
    ok('modal remains above pinned overview', Number(getComputedStyle($('libraryOverlay')).zIndex) > Number(getComputedStyle(chain).zIndex));
    $('libraryOverlay').hidden = true;
    document.documentElement.dataset.duo = 'flat';
    ok('Duo keeps its existing layout', getComputedStyle(chain).position !== 'sticky');
    delete document.documentElement.dataset.duo;
  } catch (error) { out.push('ERROR ' + error.stack); }
  finally { toolbar.style.paddingBottom = ''; $('libraryOverlay').hidden = true; if (spacer) spacer.remove(); scrollTo(0, 0); }
  document.title = out.join(' | ');
}, 150);
</script>
