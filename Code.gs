const SHEET_NAME = 'Sheet1';
const START_ROW = 2;

function doGet(e) {
  try {
    const studentId = (e && e.parameter && e.parameter.studentId) ? e.parameter.studentId : '';
    const name = (e && e.parameter && e.parameter.name) ? e.parameter.name : '';
    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : '';

    const result = checkAuth(studentId, name);

    if (callback) {
      const safeCallback = String(callback).replace(/[^a-zA-Z0-9_$.]/g, '');
      const output = `${safeCallback}(${JSON.stringify(result)})`;
      return ContentService.createTextOutput(output)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    const errorResult = {
      ok: false,
      found: false,
      message: '오류가 발생했습니다.',
      error: error.message
    };

    const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : '';
    if (callback) {
      const safeCallback = String(callback).replace(/[^a-zA-Z0-9_$.]/g, '');
      const output = `${safeCallback}(${JSON.stringify(errorResult)})`;
      return ContentService.createTextOutput(output)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    let data = {};

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = (e && e.parameter) ? e.parameter : {};
    }

    const studentId = data.studentId || '';
    const name = data.name || '';

    const result = checkAuth(studentId, name);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        found: false,
        message: '오류가 발생했습니다.',
        error: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function checkAuth(studentId, name) {
  const normalizedStudentId = normalizeStudentId(studentId);
  const normalizedName = normalizeName(name);

  if (!normalizedStudentId || !normalizedName) {
    return {
      ok: false,
      found: false,
      message: '학번과 성명을 모두 입력해주세요.'
    };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    return {
      ok: false,
      found: false,
      message: `'${SHEET_NAME}' 시트를 찾을 수 없습니다.`
    };
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < START_ROW) {
    return {
      ok: false,
      found: false,
      message: '조회할 데이터가 없습니다.'
    };
  }

  const values = sheet.getRange(START_ROW, 4, lastRow - START_ROW + 1, 3).getDisplayValues();

  for (let i = 0; i < values.length; i++) {
    const rowStudentId = normalizeStudentId(values[i][0]);
    const rowName = normalizeName(values[i][1]);
    const rowResult = String(values[i][2] || '').trim();

    if (rowStudentId === normalizedStudentId && rowName === normalizedName) {
      return {
        ok: true,
        found: true,
        studentId: values[i][0],
        name: values[i][1],
        result: rowResult || '미입력',
        message: `인증 결과는 '${rowResult || '미입력'}'입니다.`
      };
    }
  }

  return {
    ok: true,
    found: false,
    message: '일치하는 학번과 성명을 찾을 수 없습니다.'
  };
}

function normalizeStudentId(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

function normalizeName(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}
