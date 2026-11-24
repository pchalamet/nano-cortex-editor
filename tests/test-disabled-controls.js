<script>
setTimeout(() => {
  const out = [], ok = (name, condition) => out.push((condition ? 'PASS ' : 'FAIL ') + name);
  const block = state.blocks.post3;
  const pointer = (target, type, x) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, pointerId: 1, clientX: x, clientY: 100 }));
  const drag = knob => { pointer(knob, 'pointerdown', 20); pointer(window, 'pointermove', 100); pointer(window, 'pointerup', 100); };
  try {
    block.on = false; render();
    let card = $('block-post3');
    const values = JSON.stringify(block.params.map(p => p.value));
    ok('bypassed model selector is disabled', card.querySelector('.model-select').disabled);
    ok('bypassed preset and info buttons are disabled', [...card.querySelectorAll('button')].every(button => button.disabled));
    ok('bypassed parameter rows are inert and marked disabled', [...card.querySelectorAll('.param-grid > *')].every(row => row.inert && row.classList.contains('param-disabled') && row.getAttribute('aria-disabled') === 'true'));
    ok('all editing regions are inert', [...card.children].filter(child => !child.classList.contains('block-head')).every(child => child.inert));
    const knob = card.querySelector('.knob');
    drag(knob.querySelector('.slider-handle'));
    ok('dragging bypassed slider cannot change values', JSON.stringify(block.params.map(p => p.value)) === values);
    card.querySelector('.value-text').click();
    ok('bypassed slider cannot open manual entry', $('askOverlay').hidden);
    card.querySelector('.model-select').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }));
    ok('bypassed combobox cannot open dropdown', $('htmlSelectMenu').hidden);
    const model = block.model;
    card.querySelector('.model-select').value = 'None';
    card.querySelector('.model-select').dispatchEvent(new Event('change', { bubbles: true }));
    ok('bypassed combobox cannot change model', block.model === model);
    card.querySelector('.fxp-all').click();
    ok('bypassed preset button cannot open menu', !document.getElementById('fxpPopover'));
    card.querySelector('.opens-focus').click();
    ok('bypassed focus button cannot open editor', $('focusOverlay').hidden);
    $('saveBtn').focus();
    const focused = document.activeElement;
    card.querySelector('.model-select').focus();
    ok('bypassed controls cannot receive keyboard focus', document.activeElement === focused);
    card.querySelector('.toggle-switch').click();
    card = $('block-post3');
    ok('on/off switch still enables effect', block.on && !card.querySelector('.model-select').disabled && !card.querySelector('.param-grid').inert);
    ok('enabling restores preset controls', !card.querySelector('.fxp-all').disabled);
    const old = block.params[0].value;
    drag(card.querySelector('.slider-handle'));
    ok('enabling restores slider interaction', block.params[0].value !== old);
    card.querySelector('.toggle-switch').click();
    ok('turning effect off disables editors again', !block.on && $('block-post3').querySelector('.model-select').disabled);
    block.model = 'None'; block.params = []; render();
    ok('empty slot model picker remains usable', !$('block-post3').querySelector('.model-select').disabled && !$('block-post3').querySelector('.model-select').closest('[inert]'));
    state.gate.on = false; renderGate();
    ok('bypassed gate parameter is inert', $('gateParams').firstElementChild.inert);
    $('gateToggle').click();
    ok('gate switch restores parameter interaction', state.gate.on && !$('gateParams').firstElementChild.inert);
  } catch (error) { out.push('ERROR ' + error.stack); }
  document.title = out.join(' | ');
}, 100);
</script>
