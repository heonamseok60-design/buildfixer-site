// Toss Payments 결제 승인 API 프록시
// Vercel 프로젝트 Settings > Environment Variables 에 TOSS_SECRET_KEY 를 등록해야 동작합니다.
// (테스트 단계: 토스 개발자센터에서 발급받은 테스트 시크릿 키 / 실서비스 전환 시: 실 가맹점 시크릿 키로 교체)

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ message: "서버에 TOSS_SECRET_KEY 환경변수가 설정되지 않았습니다." });
    return;
  }

  const { paymentKey, orderId, amount } = req.body || {};
  if (!paymentKey || !orderId || !amount) {
    res.status(400).json({ message: "결제 정보가 올바르지 않습니다." });
    return;
  }

  const encodedKey = Buffer.from(secretKey + ":").toString("base64");

  try {
    const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await tossRes.json();

    if (!tossRes.ok) {
      res.status(tossRes.status).json({ message: data.message || "결제 승인에 실패했습니다." });
      return;
    }

    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ message: "결제 승인 중 서버 오류가 발생했습니다." });
  }
};
