import LegalPage, { generateLegalMetadata } from "@/components/LegalPage";

export const metadata = generateLegalMetadata("refunds");

export default function Refunds() {
  return <LegalPage type="refunds" />;
}
