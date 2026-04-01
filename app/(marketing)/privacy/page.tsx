import LegalPage, { generateLegalMetadata } from "@/components/LegalPage";

export const metadata = generateLegalMetadata("privacy");

export default function Privacy() {
  return <LegalPage type="privacy" />;
}
