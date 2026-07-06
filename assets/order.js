const SERVICES = [
  { id: "contract_basic", name: "계약내역서 작성 (민간)", price: 100000, duration: "1일", docs: "사업자등록증, 설계내역서, 낙찰금액" },
  { id: "contract_full", name: "계약내역서 작성 (일위대가 포함)", price: 220000, duration: "1-3일", docs: "사업자등록증, 설계내역서, 낙찰금액" },
  { id: "progress_basic", name: "기성내역서 작성 (민간)", price: 150000, duration: "3일", docs: "계약내역서" },
  { id: "progress_full", name: "기성내역서 작성 (관급수량 포함)", price: 300000, duration: "3-5일", docs: "계약내역서" },
  { id: "labor", name: "노무비 구분관리 내역서 (10인 이하 기준)", price: 200000, duration: "1-3일", docs: "노무명세서, 신분증, 기초안전교육증, 개인통장사본, 사업자등록증, 세금계산서" },
  { id: "schedule_pro", name: "공정표 작성 (전문건설)", price: 200000, duration: "1-3일", docs: "계약내역서, 도면" },
  { id: "schedule_gen", name: "공정표 작성 (종합건설·내역분할)", price: 2000000, duration: "7일", docs: "계약내역서, 도면" },
  { id: "quantity", name: "수량산출", inquiry: true, note: "규모별 상이 · 소요기간 2-15일 · 별도 문의" },
  { id: "design", name: "설계누락분 확인", inquiry: true, note: "증액의 20% · 전문건설 2-5일 / 종합건설 15-30일 · 별도 문의" },
  { id: "start", name: "착공계 (서류일체)", price: 500000, duration: "3-7일", docs: "사업자등록증, 배치기술자정보계약서, 계약내역서, 공사개요, 공정표" },
  { id: "end", name: "준공계 (서류일체)", price: 500000, duration: "3-7일", docs: "사업자등록증, 준공내역서, 각종 필증, 준공사진" },
  { id: "road", name: "도로점용허가 (출장비 제외)", price: 250000, duration: "1-3일", docs: "사업자등록증, 공사개요, 배치도" },
  { id: "dust", name: "비산먼지 발생 신고", price: 200000, duration: "2-4일", docs: "사업자등록증, 공사개요" },
  { id: "specific", name: "특정공사 사전신고", price: 200000, duration: "2-4일", docs: "사업자등록증, 공사개요" },
];

function formatWon(n) {
  return n.toLocaleString("ko-KR") + "원";
}

function renderList() {
  const listEl = document.getElementById("order-list");
  listEl.innerHTML = "";

  SERVICES.forEach((s) => {
    const row = document.createElement("label");
    row.className = "order-row";
    if (s.inquiry) {
      row.innerHTML = `
        <input type="checkbox" data-id="${s.id}" data-price="0" data-inquiry="1">
        <div class="info">
          <h4>${s.name}</h4>
          <p>${s.note}</p>
        </div>
        <div class="amount muted">별도 문의</div>
      `;
    } else {
      row.innerHTML = `
        <input type="checkbox" data-id="${s.id}" data-price="${s.price}">
        <div class="info">
          <h4>${s.name}</h4>
          <p>소요기간 ${s.duration} · 준비자료: ${s.docs}</p>
        </div>
        <div class="amount">${formatWon(s.price)}</div>
      `;
    }
    listEl.appendChild(row);
  });

  listEl.addEventListener("change", updateSummary);
}

function updateSummary() {
  const checked = Array.from(document.querySelectorAll("#order-list input[type=checkbox]:checked"));
  const supply = checked.reduce((sum, el) => sum + Number(el.dataset.price || 0), 0);
  const vat = Math.round(supply * 0.1);
  const total = supply + vat;

  document.getElementById("sum-supply").textContent = formatWon(supply);
  document.getElementById("sum-vat").textContent = formatWon(vat);
  document.getElementById("sum-total").textContent = formatWon(total);

  const inquiryChecked = checked.some((el) => el.dataset.inquiry === "1");
  document.getElementById("inquiry-note").style.display = inquiryChecked ? "block" : "none";

  window.__selectedNames = checked.map((el) => {
    const item = SERVICES.find((s) => s.id === el.dataset.id);
    return item ? item.name : el.dataset.id;
  });
  window.__selectedSupply = supply;
  window.__selectedVat = vat;
}

function submitOrder(e) {
  e.preventDefault();

  const names = window.__selectedNames || [];
  if (names.length === 0) {
    alert("먼저 필요한 업무를 하나 이상 선택해 주세요.");
    return;
  }

  const company = document.getElementById("f-company").value.trim();
  const manager = document.getElementById("f-manager").value.trim();
  const phone = document.getElementById("f-phone").value.trim();
  const site = document.getElementById("f-site").value.trim();
  const memo = document.getElementById("f-memo").value.trim();

  if (!company || !phone) {
    alert("발주처와 연락처는 꼭 입력해 주세요.");
    return;
  }

  const supply = window.__selectedSupply || 0;
  const vat = window.__selectedVat || 0;

  const bodyLines = [
    "[빌드픽서 상담 신청]",
    "",
    "발주처: " + company,
    "담당자: " + (manager || "-"),
    "연락처: " + phone,
    "현장명: " + (site || "-"),
    "",
    "선택 업무:",
    ...names.map((n) => "- " + n),
    "",
    "신청금액: " + formatWon(supply),
    "부가세(10%): " + formatWon(vat),
    "총 금액: (상담 후 확정)",
    "",
    "요청사항: " + (memo || "-"),
  ];

  const fullText = bodyLines.join("\n");
  const subject = encodeURIComponent("[빌드픽서 상담 신청] " + company);
  const body = encodeURIComponent(fullText);

  document.getElementById("mailto-link").href = `mailto:sim9416@nate.com?subject=${subject}&body=${body}`;
  document.getElementById("result-text").value = fullText;

  const resultBox = document.getElementById("submit-result");
  resultBox.style.display = "block";
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.addEventListener("DOMContentLoaded", () => {
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const text = document.getElementById("result-text").value;
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = "복사 완료!";
        setTimeout(() => { copyBtn.textContent = "내용 복사하기"; }, 1800);
      } catch (e) {
        alert("복사에 실패했습니다. 텍스트를 직접 선택해서 복사해 주세요.");
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  renderList();
  updateSummary();
  document.getElementById("order-form").addEventListener("submit", submitOrder);
});
