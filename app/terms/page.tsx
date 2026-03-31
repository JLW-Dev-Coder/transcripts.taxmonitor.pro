import LegalPage, { generateLegalMetadata } from "@/components/LegalPage";

export const metadata = generateLegalMetadata("terms");

export default function Terms() {
  return <LegalPage type="terms" />;
}
