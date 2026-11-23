<script>
setTimeout(() => {
  const out = [], ok = (name, condition) => out.push((condition ? 'PASS ' : 'FAIL ') + name);
  const locked = () => getComputedStyle(document.documentElement).overflowY === 'hidden' && getComputedStyle(document.body).overflowY === 'hidden';
  const library = $('libraryOverlay'), ask = $('askOverlay');
  let dynamic, spacer;
  try {
    spacer = document.createElement('div');
    spacer.style.height = '2500px';
    document.body.appendChild(spacer);
    scrollTo(0, 150);
    const start = scrollY;
    ok('page is unlocked initially', !locked());
    library.hidden = false;
    ok('library locks page scrolling', locked());
    ok('opening modal preserves page position', scrollY === start);
    const list = library.querySelector('.lib-list');
    const content = document.createElement('div');
    content.style.height = '2000px';
    list.appendChild(content);
    list.scrollTop = 100;
    ok('library list remains independently scrollable', getComputedStyle(list).overflowY === 'auto' && list.scrollTop === 100 && scrollY === start);
    content.remove();
    ask.hidden = false;
    library.hidden = true;
    ok('nested confirmation keeps scroll locked', locked());
    ask.hidden = true;
    ok('closing final modal restores scrolling and page position', !locked() && scrollY === start);
    for (const className of ['ask-overlay', 'lib-overlay', 'tuner-overlay', 'wheel-overlay']) {
      dynamic = document.createElement('div');
      dynamic.className = className;
      dynamic.hidden = true;
      document.body.appendChild(dynamic);
      ok(className + ': hidden modal leaves page unlocked', !locked());
      dynamic.hidden = false;
      ok(className + ': dynamically added modal locks page', locked());
      dynamic.remove();
      ok(className + ': removing modal restores scrolling', !locked());
    }
    const inline = document.createElement('div');
    inline.className = 'ask-overlay';
    spacer.appendChild(inline);
    ok('embedded live panel does not lock page', !locked());
  } catch (error) { out.push('ERROR ' + error.stack); }
  finally { library.hidden = true; ask.hidden = true; if (dynamic) dynamic.remove(); if (spacer) spacer.remove(); }
  document.title = out.join(' | ');
}, 100);
</script>
