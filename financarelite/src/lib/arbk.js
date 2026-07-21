/** Parses the exact ARBK bridge payload shape the FinanCare-ARBK-Extension sends. */
export function parseArbkPayload(payloadStr) {
  const parsed = JSON.parse(payloadStr);
  const list = parsed?.tableSearch?.tableList || [];
  return list
    .filter((item) => item.teDhenatBiznesit && item.teDhenatBiznesit.StatusiARBK === "Regjistruar")
    .map((item) => item.teDhenatBiznesit);
}
