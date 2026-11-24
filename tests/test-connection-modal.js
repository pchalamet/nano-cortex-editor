<script>
setTimeout(async () => {
  const out = [], ok = (name, condition) => out.push((condition ? 'PASS ' : 'FAIL ') + name);
  const wait = () => new Promise(resolve => setTimeout(resolve, 30));
  const hero = $('connectHero'), connect = $('connectBtn'), action = $('heroConnect');
  const originalConnect = connectAll;
  try {
    connect.click();
    state.connected = false; setStatus('Disconnected');
    ok('disconnect dismisses connection menu', $('moreMenu').hidden && $('moreBackdrop').hidden);
    ok('connection screen is a visible modal', !hero.hidden && hero.getAttribute('role') === 'dialog' && hero.getAttribute('aria-modal') === 'true');
    const bounds = hero.getBoundingClientRect();
    ok('modal covers whole window', bounds.top === 0 && bounds.left === 0 && bounds.bottom === innerHeight && bounds.right === innerWidth);
    ok('background controls and other dialogs are inert', document.querySelector('header.topbar').inert && $('captureCard').parentElement.inert && $('jamDock').inert && $('libraryOverlay').inert);
    ok('modal owns focus and background cannot take it', document.activeElement === action && ($('saveBtn').focus(), document.activeElement === action));
    const save = $('saveBtn').getBoundingClientRect();
    ok('clicks over toolbar hit modal', !!document.elementFromPoint(save.left + save.width / 2, save.top + save.height / 2).closest('#connectHero'));
    ok('background scrolling is locked', getComputedStyle(document.documentElement).overflowY === 'hidden' && getComputedStyle(document.body).overflowY === 'hidden');
    const tab = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
    action.dispatchEvent(tab);
    ok('Tab stays within connection dialog', tab.defaultPrevented && document.activeElement === action);
    const before = viewPrefs.view;
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '2', ctrlKey: true, metaKey: true, bubbles: true, cancelable: true }));
    ok('editor shortcuts cannot act behind dialog', viewPrefs.view === before);
    let attempts = 0;
    connectAll = () => { attempts++; };
    action.click();
    ok('modal Connect action still works', attempts === 1);
    setStatus('Connecting…');
    ok('connection in progress retains focus inside modal', hero.contains(document.activeElement));
    state.connected = true; setStatus('Connected', true);
    ok('connection restores window interaction', hero.hidden && !document.querySelector('header.topbar').inert && !$('chain').inert && !$('jamDock').inert && !$('libraryOverlay').inert);
    ok('connection restores focus to status button', document.activeElement === connect);
    $('presetSelect').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }));
    state.connected = false; setStatus('Disconnected'); await wait();
    ok('disconnect closes dropdown from underlying window', $('htmlSelectMenu').hidden);
  } catch (error) { out.push('ERROR ' + error.stack); }
  finally { connectAll = originalConnect; state.connected = true; setStatus('Connected', true); }
  document.title = out.join(' | ');
}, 100);
</script>
