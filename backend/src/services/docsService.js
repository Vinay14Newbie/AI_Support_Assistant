import docs from "../utils/docs.json" assert { type: "json" };

export function findRelevantDocs(question) {
  const lower = question.toLowerCase();

  return docs.filter(
    (doc) =>
      lower.includes(doc.title.toLowerCase()) ||
      lower.includes("password") ||
      lower.includes("refund"),
  );
}
