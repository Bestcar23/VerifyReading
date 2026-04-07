const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyMf1rP8Zf1SWZQbWCox0-KMznlM4eWMSxJMSEaJTrfh7JxjzSW1yJyHmUxeCQyduUa/exec';

const form = document.getElementById('authForm');
const studentIdInput = document.getElementById('studentId');
const nameInput = document.getElementById('name');
const submitButton = document.getElementById('submitButton');
const statusText = document.getElementById('statusText');
const resultCard = document.getElementById('resultCard');
const resultChip = document.getElementById('resultChip');
const resultStudentId = document.getElementById('resultStudentId');
const resultName = document.getElementById('resultName');
const resultMessage = document.getElementById('resultMessage');

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? '조회 중...' : '인증 결과 확인';
}

function hideResult() {
  resultCard.className = 'result-card hidden';
}

function showResult(data) {
  resultCard.classList.remove('hidden', 'success', 'fail', 'neutral');

  if (data.found && data.result === '충족') {
    resultCard.classList.add('success');
  } else if (data.found && data.result === '미충족') {
    resultCard.classList.add('fail');
  } else {
    resultCard.classList.add('neutral');
  }

  resultChip.textContent = data.found ? (data.result || '미입력') : '조회 결과 없음';
  resultStudentId.textContent = data.studentId || studentIdInput.value.trim() || '-';
  resultName.textContent = data.name || nameInput.value.trim() || '-';
  resultMessage.textContent = data.message || '조회 결과를 불러왔습니다.';
}

function runJsonpRequest(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `sehwaAuthCallback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('응답 시간이 초과되었습니다.'));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timer);
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      try {
        delete window[callbackName];
      } catch (err) {
        window[callbackName] = undefined;
      }
    }

    window[callbackName] = (response) => {
      cleanup();
      resolve(response);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error('웹 앱에 연결할 수 없습니다.')); 
    };

    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

async function handleSubmit(event) {
  event.preventDefault();

  const studentId = studentIdInput.value.trim();
  const name = nameInput.value.trim();

  hideResult();

  if (!studentId || !name) {
    statusText.textContent = '학번과 성명을 모두 입력해주세요.';
    return;
  }

  statusText.textContent = '인증 정보를 조회하고 있습니다.';
  setLoading(true);

  try {
    const url = `${APPS_SCRIPT_URL}?studentId=${encodeURIComponent(studentId)}&name=${encodeURIComponent(name)}`;
    const data = await runJsonpRequest(url);

    if (!data || typeof data !== 'object') {
      throw new Error('응답 형식이 올바르지 않습니다.');
    }

    statusText.textContent = data.found
      ? '인증 정보를 확인했습니다.'
      : (data.message || '일치하는 정보가 없습니다.');

    showResult(data);
  } catch (error) {
    statusText.textContent = error.message || '조회 중 오류가 발생했습니다.';
    showResult({
      found: false,
      studentId,
      name,
      message: '연결 상태를 확인한 뒤 다시 시도해주세요.'
    });
  } finally {
    setLoading(false);
  }
}

form.addEventListener('submit', handleSubmit);
