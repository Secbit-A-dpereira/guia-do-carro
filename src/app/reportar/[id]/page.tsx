import ReportarClient from "./client-page";

export async function generateStaticParams() {
  return [];
}

export default function Page() {
  return <ReportarClient />;
}
