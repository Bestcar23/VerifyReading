(() => {
  const form = document.getElementById('lookupForm');
  const studentIdInput = document.getElementById('studentId');
  const nameInput = document.getElementById('name');
  const statusMessage = document.getElementById('statusMessage');
  const resultPanel = document.getElementById('resultPanel');
  const resultValue = document.getElementById('resultValue');
  const resultDescription = document.getElementById('resultDescription');
  const identityChip = document.getElementById('identityChip');
  const submitButton = document.getElementById('submitButton');

  const APPS_SCRIPT_URL = window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL;

  function setStatus(message) {
    statusMessage.textContent = message || '';
  }

  function resetResult() {
    resultPanel.hidden = true;
    resultPanel.className = 'result-panel';
    resultValue.textContent = '';
    resultDescription.textContent = '';
    identityChip.textContent = '';
  }

  function escapeForScriptTag(value) {
    return String(value || '').replace(/[<>]/g, '');
  }

  function requestJsonp(url, timeout = 12000) {
    return new Promise((resolve, reject) => {
      const callbackName = `jsonpCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const script = document.createElement('script');
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('응답 시간이 초과되었습니다.'));
      }, timeout);

      function cleanup() {
        clearTimeout(timer);
        if (script.parentNode) script.parentNode.removeChild(script);
        try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
      }

      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('웹앱에 연결할 수 없습니다.'));
      };

      const connector = url.includes('?') ? '&' : '?';
      script.src = `${url}${connector}callback=${callbackName}`;
      document.body.appendChild(script);
    });
  }

  function renderResult(data) {
    const result = String(data.result || '').trim();
    const studentId = data.studentId || '';
    const name = data.name || '';

    resultPanel.hidden = false;

    if (result === '충족') {
      resultPanel.classList.add('is-success');
      resultValue.textContent = '충족';
      resultDescription.textContent = '독서가 인증 요건이 충족된 것으로 확인되었습니다.';
    } else if (result === '미충족') {
      resultPanel.classList.add('is-danger');
      resultValue.textContent = '미충족';
      resultDescription.textContent = '현재 기준으로는 독서가 인증 요건이 충족되지 않은 상태입니다.';
    } else {
      resultPanel.classList.add('is-neutral');
      resultValue.textContent = result || '미입력';
      resultDescription.textContent = '시트에 입력된 인증 상태를 그대로 표시한 결과입니다.';
    }

    identityChip.textContent = `${studentId} · ${name}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetResult();

    const studentId = studentIdInput.value.trim();
    const name = nameInput.value.trim();

    if (!studentId || !name) {
      setStatus('학번과 성명을 모두 입력해주세요.');
      return;
    }

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes('YOUR_APPS_SCRIPT')) {
      setStatus('Apps Script URL이 설정되지 않았습니다.');
      return;
    }

    submitButton.disabled = true;
    setStatus('인증 결과를 조회하고 있습니다...');

    try {
      const url = `${APPS_SCRIPT_URL}?studentId=${encodeURIComponent(escapeForScriptTag(studentId))}&name=${encodeURIComponent(escapeForScriptTag(name))}`;
      const data = await requestJsonp(url);

      if (!data || data.ok === false) {
        setStatus((data && data.message) || '조회 중 오류가 발생했습니다.');
        return;
      }

      if (!data.found) {
        setStatus(data.message || '일치하는 학번과 성명을 찾을 수 없습니다.');
        return;
      }

      setStatus('');
      renderResult(data);
    } catch (error) {
      setStatus(error.message || '조회 중 오류가 발생했습니다.');
    } finally {
      submitButton.disabled = false;
    }
  });
})();
