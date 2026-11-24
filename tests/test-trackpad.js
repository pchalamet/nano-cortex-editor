<script>
setTimeout(() => {
  const out = [], ok = (name, condition) => out.push((condition ? 'PASS ' : 'FAIL ') + name);
  const wheel = (target, deltaX, deltaY = 0, extra = {}) => {
    const event = new WheelEvent('wheel', { deltaX, deltaY, bubbles: true, cancelable: true, ...extra });
    target.dispatchEvent(event);
    return event;
  };
  const fixture = document.createElement('div');
  document.body.appendChild(fixture);
  const check = (name, node, read) => {
    fixture.appendChild(node);
    const target = node.querySelector('.knob') || node;
    const start = read();
    ok(name + ': vertical scroll leaves value and browser scrolling unchanged', !wheel(target, 0, 50).defaultPrevented && read() === start);
    ok(name + ': vertical diagonal ignores horizontal noise', !wheel(target, 2, 50).defaultPrevented && read() === start);
    ok(name + ': horizontal scroll leaves value unchanged', !wheel(target, -50, 2).defaultPrevented && read() === start);
    ok(name + ': opposite horizontal scroll leaves value unchanged', !wheel(target, 50).defaultPrevented && read() === start);
    ok(name + ': pinch zoom does not change value', !wheel(target, 50, 0, { ctrlKey: true }).defaultPrevented && read() === start);
  };
  try {
    setAmpKnob = () => {};
    setCaptureVolumeDb = () => {};
    state.amp.gain = 128;
    check('amp', renderAmpKnob('gain', 'Gain'), () => state.amp.gain);
    const param = { name: 'Gain', value: 5, meta: rangeMeta(0, 10, 0.1, '', 1) };
    const fx = renderKnobParam('pre1', param, '#fff', false, false);
    check('effect', fx, () => param.value);
    wheel(fx.querySelector('.param-name'), -20);
    ok('scrolling slider label leaves value unchanged', param.value === 5);
    fx.querySelector('.slider-handle').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, pointerId: 1, clientX: 20, clientY: 100 }));
    window.dispatchEvent(new PointerEvent('pointermove', { pointerId: 1, clientX: 80, clientY: 40 }));
    window.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1, clientX: 80, clientY: 40 }));
    ok('click and drag still adjusts slider', param.value > 5);
    const locked = { ...param, value: 5 };
    const disabled = renderKnobParam('pre1', locked, '#fff', false, true);
    fixture.appendChild(disabled);
    ok('disabled effect cannot change', !wheel(disabled.querySelector('.knob'), 50).defaultPrevented && locked.value === 5);
    let cab = -6;
    check('cab', renderCabKnob('Level', 'level', cab, value => { cab = value; }), () => cab);
    setCaptureVolumeUI(0);
    check('capture volume', renderCaptureVolumeKnob(), () => Number($('captureVolumeSlider').value));
    const range = document.createElement('input');
    range.type = 'range'; range.min = '0'; range.max = '10'; range.step = '0.5'; range.value = '5';
    let inputs = 0, changes = 0;
    range.addEventListener('input', () => inputs++);
    range.addEventListener('change', () => changes++);
    check('native range', range, () => Number(range.value));
    ok('scrolling range emits no value changes', inputs === 0 && changes === 0);
    range.value = '10'; wheel(range, -50);
    ok('range clamps at maximum without redundant events', range.value === '10' && inputs === 0 && changes === 0);
    range.disabled = true;
    ok('disabled range ignores horizontal scroll', !wheel(range, -50).defaultPrevented && range.value === '10');
    const empty = document.createElement('div'); fixture.appendChild(empty);
    ok('horizontal scroll outside controls remains available', !wheel(empty, 50).defaultPrevented);
    $('connectBtn').click();
    const before = param.value;
    ok('open menu blocks control scrolling', wheel(fx.querySelector('.knob'), 50).defaultPrevented && param.value === before);
    toggleMoreMenu(false);
  } catch (error) { out.push('ERROR ' + error.stack); }
  finally { fixture.remove(); }
  document.title = out.join(' | ');
}, 100);
</script>
