import BranchDetailPage from "../../../_components/rbac/BranchDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BranchDetailPage branchId={id} />;
}
