import FeesManagementClient from "@/components/actions/FeesManagementClient";

export default async function Page() {
  // Later you can fetch from DB here and pass as props.
  // const feeStructures = await db.feeStructure.findMany(...)
  // const assignments = await db.feeAssignment.findMany(...)

  return (
    <div className="flex-1 overflow-y-auto">
      <FeesManagementClient />
    </div>
  );
}
