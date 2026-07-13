import { columns, Config, configs } from "@/components/logs/columns"
import { DataTable } from "@/components/logs/data-table"

async function getData(): Promise<Config[]> {
  return configs
}

export default async function Home() {
  const data = await getData()
  return (
    <div className="flex flex-1 h-full min-h-0 flex-col p-4 overflow-hidden">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
