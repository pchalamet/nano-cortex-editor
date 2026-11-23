<script>
setTimeout(() => {
  const out = [], ok = (name, condition) => out.push((condition ? 'PASS ' : 'FAIL ') + name);
  const menu = $('moreMenu'), backdrop = $('moreBackdrop'), button = $('moreBtn');
  const wheel = (target, deltaY, deltaMode = 0) => {
    const event = new WheelEvent('wheel', { deltaY, deltaMode, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };
  let fixture;
  try {
    button.click();
    ok('more button opens menu and dismissal surface', !menu.hidden && !backdrop.hidden && button.getAttribute('aria-expanded') === 'true');
    ok('menu fits viewport', menu.getBoundingClientRect().bottom <= innerHeight - 7);
    ok('outside surface covers title bar', getComputedStyle(backdrop).getPropertyValue('-webkit-app-region') === 'no-drag');
    const pageScroll = scrollY;
    ok('outside wheel is prevented', wheel(backdrop, 200).defaultPrevented && scrollY === pageScroll);
    let underlyingWheel = false;
    fixture = document.createElement('div');
    fixture.addEventListener('wheel', () => { underlyingWheel = true; });
    document.body.appendChild(fixture);
    wheel(fixture, 200);
    ok('underlying controls do not receive wheel events', !underlyingWheel);
    menu.style.maxHeight = '160px';
    menu.scrollTop = 0;
    ok('wheel scrolls menu only', wheel(menu.querySelector('button'), 100).defaultPrevented && menu.scrollTop > 0 && scrollY === pageScroll);
    menu.scrollTop = menu.scrollHeight;
    ok('bottom edge contains wheel', wheel(menu, 200).defaultPrevented && scrollY === pageScroll);
    menu.scrollTop = 0;
    ok('top edge contains wheel', wheel(menu, -200).defaultPrevented && scrollY === pageScroll);
    backdrop.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    ok('outside press dismisses menu and surface', menu.hidden && backdrop.hidden && button.getAttribute('aria-expanded') === 'false');
    ok('wheel is restored after dismissal', !wheel(fixture, 100).defaultPrevented && underlyingWheel);
    button.click(); backdrop.click();
    ok('accessible outside click dismisses menu', menu.hidden && backdrop.hidden);
    button.click();
    const cancelled = new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 });
    cancelled.preventDefault();
    fixture.dispatchEvent(cancelled);
    ok('prevented outside events still dismiss menu', menu.hidden);
    button.click(); button.click();
    ok('trigger toggles menu closed', menu.hidden && backdrop.hidden);
    button.click();
    const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
    menu.dispatchEvent(escape);
    ok('Escape dismisses and restores trigger focus', menu.hidden && escape.defaultPrevented && document.activeElement === button);
    button.click();
    menu.querySelector('.view-item').click();
    ok('menu actions dismiss menu', menu.hidden && backdrop.hidden);
  } catch (error) { out.push('ERROR ' + error.stack); }
  finally { toggleMoreMenu(false); if (fixture) fixture.remove(); }
  document.title = out.join(' | ');
}, 100);
</script>
