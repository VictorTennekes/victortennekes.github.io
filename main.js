// @ts-check
(function () {
  // ---- filesystem ----
  /** @type {Record<string, string>} */
  const FS = {
    'README.md': '<span class="h"># Victor Tennekes</span>\nSenior data engineer, Amsterdam. Runs Dott\'s production data platform end to end.\nLearned C before AI tools existed; now builds and ships AI systems, and verifies what they produce.\n\n<span class="c">Try: cat stack.yaml · cat oncall.md · cat projects.md</span>',
    'stack.yaml': '<span class="k">runtime</span>:   kubernetes      <span class="c"># self-managed GKE</span>\n<span class="k">delivery</span>:  [argocd, helm]  <span class="c"># gitops</span>\n<span class="k">infra</span>:     [terraform, iam] <span class="c"># security as code, PII policy</span>\n<span class="k">pipelines</span>: airflow         <span class="c"># <span class="n">100+</span> in production</span>\n<span class="k">data</span>:      [bigquery, dbt]\n<span class="k">ai</span>:        [llm-agents, mcp]\n<span class="k">code</span>:      [python, sql, c++, c]',
    'oncall.md': '<span class="h"># On-call</span>\n<span class="m">triage</span> → <span class="m">root cause</span> → <span class="m">recover</span> → <span class="m">postmortem</span> → <span class="m">automate</span>\n\nOwns incident response for the platform. Restored business-critical finance\nreporting, then made that failure impossible to repeat.\n\nObservability: AI-assisted root-cause analysis on alerts, actionable Slack\nalerting, pipeline metrics for SLA tracking.',
    'projects.md': '<span class="h"># OTTO</span>\nDott\'s conversational analytics agent. Designed, built and operated by me.\n\n<span class="k">stack</span>     python, fastapi, gke, mcp\n<span class="k">surfaces</span>  slack, web, mcp server <span class="c">(behind SSO)</span>\n<span class="k">coverage</span>  <span class="n">6,400+</span> tables\n<span class="k">tests</span>     <span class="n">1,400+</span> unit tests\n<span class="k">adoption</span>  <span class="n">~1,150</span> sessions in the first two months\n\n<span class="h"># BI tool migration</span>\nLed the evaluation and proof of concept for <span class="n">3</span> applications to replace Tableau.\nSelf-hosted on GKE via ArgoCD behind IAP, on BigQuery and dbt.',
    'timeline.log': '<span class="n">2019</span>  CODAM, Amsterdam <span class="c">(42 network, peer-learning)</span>\n<span class="n">2022</span>  Dott · data engineer intern <span class="c">· 42Heilbronn assistant team</span>\n<span class="n">2023</span>  Dott · senior data engineer <span class="c">(I → II → senior)</span>\n<span class="n">now </span>  Operating the platform, shipping OTTO',
    'contact': '<span class="k">github</span>    <a href="https://github.com/victortennekes">github.com/victortennekes</a>\n<span class="k">linkedin</span>  <a href="https://www.linkedin.com/in/victortennekes">linkedin.com/in/victortennekes</a>\n<span class="k">mail</span>      <a class="mail" href="#" data-e="moc.duolci@sekennetrotciv">email</a>\n<span class="k">speaks</span>    nl, en, de'
  };
  const FILES = ['README.md', 'stack.yaml', 'oncall.md', 'projects.md', 'timeline.log', 'contact'];
  const CMDNAMES = ['help', 'ls', 'cat', 'tree', 'pwd', 'whoami', 'clear'];

  const out = /** @type {HTMLElement} */ (document.getElementById('out'));
  const form = /** @type {HTMLFormElement} */ (document.getElementById('form'));
  const input = /** @type {HTMLInputElement} */ (document.getElementById('in'));
  const term = /** @type {HTMLElement} */ (document.getElementById('term'));
  const ls0 = /** @type {HTMLElement} */ (document.getElementById('ls0'));

  /** @type {string[]} */
  const history = [];
  let hi = 0;

  /** Wire obfuscated email links: first click reveals and arms mailto, second click opens. @param {ParentNode} root */
  function demail(root) {
    root.querySelectorAll('a.mail[data-e]').forEach(function (el) {
      const a = /** @type {HTMLAnchorElement} */ (el);
      a.title = 'click to reveal';
      a.addEventListener('click', function (ev) {
        const enc = a.getAttribute('data-e');
        if (enc === null) return;
        ev.preventDefault();
        const e = enc.split('').reverse().join('');
        a.href = 'mailto:' + e; a.textContent = e; a.removeAttribute('data-e'); a.title = '';
      });
    });
  }
  demail(document);

  /** @param {string} s */
  function esc(s) { return s.replace(/[&<>]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] || c; }); }
  /** @param {string} p */
  function norm(p) { return (p || '').replace(/^~\/?/, '').replace(/^\.\//, '').replace(/\/+$/, ''); }

  function lsHtml() {
    return FILES.map(function (f) { return '<span class="f" data-cmd="cat ' + f + '">' + f + '</span>'; }).join('');
  }
  ls0.innerHTML = lsHtml();

  const HELP = '<span class="c">commands:</span>  <span class="f" data-cmd="ls">ls</span>   <span class="f" data-cmd="cat README.md">cat</span> &lt;file&gt;   <span class="f" data-cmd="tree">tree</span>   <span class="f" data-cmd="pwd">pwd</span>   <span class="f" data-cmd="whoami">whoami</span>   <span class="f" data-cmd="clear">clear</span>\n<span class="c">tip:</span>       click a filename, or tab to complete';
  const TREE = '<span class="d">.</span>\n' + FILES.map(function (f, i) {
    return (i === FILES.length - 1 ? '└── ' : '├── ') + '<span class="f" data-cmd="cat ' + f + '">' + f + '</span>';
  }).join('\n') + '\n\n<span class="c">0 directories, ' + FILES.length + ' files</span>';

  /** @param {string} name @param {string} arg @returns {string} */
  function exec(name, arg) {
    switch (name) {
      case 'help': return HELP;
      case 'pwd': return '/home/victor';
      case 'whoami': return 'victor';
      case 'tree': return TREE;
      case 'ls': {
        const d = norm(arg);
        if (d === '') return '<span class="ls">' + lsHtml() + '</span>';
        if (FS[d] !== undefined) return esc(d);
        return '<span class="err">ls:</span> ' + esc(arg) + ': No such file or directory';
      }
      case 'cat': {
        if (!arg) return '<span class="err">cat:</span> missing file · try <span class="f" data-cmd="ls">ls</span>';
        const p = norm(arg);
        if (FS[p] !== undefined) return FS[p];
        return '<span class="err">cat:</span> ' + esc(arg) + ': No such file or directory';
      }
      case 'cd': return '<span class="c">~ is all there is.</span>';
      case 'rm': case 'sudo': return '<span class="c">nice try.</span>';
      case 'vim': case 'vi': case 'nano': case 'emacs': return '<span class="c">read-only filesystem. cat works though.</span>';
      default: return '<span class="err">command not found:</span> ' + esc(name) + ' <span class="c">· try</span> <span class="f" data-cmd="help">help</span>';
    }
  }

  /** @param {string} raw */
  function run(raw) {
    const line = raw.trim();
    if (!line) return;
    history.push(line); hi = history.length;
    const parts = line.split(/\s+/);
    const name = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');
    out.innerHTML = '';
    if (name === 'clear' || (name === 'ls' && !arg)) return;
    const block = document.createElement('div'); block.className = 'block new';
    const cmd = document.createElement('p'); cmd.className = 'cmd'; cmd.innerHTML = '<b>' + esc(line) + '</b>'; block.appendChild(cmd);
    const res = document.createElement('p'); res.className = 'res'; res.innerHTML = exec(name, arg); block.appendChild(res);
    out.appendChild(block); demail(block);
    form.scrollIntoView({ block: 'nearest' });
  }

  /** @param {string} v @returns {string | null} */
  function complete(v) {
    const parts = v.split(/\s+/);
    if (parts.length === 1) {
      const m = CMDNAMES.filter(function (n) { return n.indexOf(parts[0].toLowerCase()) === 0; });
      return m.length === 1 ? m[0] + ' ' : null;
    }
    const frag = norm(parts[parts.length - 1]);
    const hits = Object.keys(FS).filter(function (p) { return p.indexOf(frag) === 0; });
    if (hits.length === 1) return parts.slice(0, -1).join(' ') + ' ' + hits[0];
    if (hits.length > 1) {
      let pre = hits[0];
      hits.forEach(function (h) { while (h.indexOf(pre) !== 0) pre = pre.slice(0, -1); });
      return pre.length > frag.length ? parts.slice(0, -1).join(' ') + ' ' + pre : null;
    }
    return null;
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { e.preventDefault(); if (hi > 0) { hi--; input.value = history[hi]; } }
    else if (e.key === 'ArrowDown') { e.preventDefault(); if (hi < history.length - 1) { hi++; input.value = history[hi]; } else { hi = history.length; input.value = ''; } }
    else if (e.key === 'Tab') { const c = complete(input.value); if (c !== null) { e.preventDefault(); input.value = c; } }
    else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
  });
  term.addEventListener('click', function (e) {
    const target = /** @type {HTMLElement} */ (e.target);
    const f = target.closest('[data-cmd]');
    if (f) { run(f.getAttribute('data-cmd') || ''); input.focus(); return; }
    if (target.closest('a')) return;
    if (String(window.getSelection && window.getSelection())) return;
    input.focus();
  });
})();
