import { JobList } from "@/components/jobs/JobList";
import { JobSearch } from "@/components/jobs/JobSearch";

export default function JobFeed() {

  return (
    <div>
      <h1 className="text-2xl font-bold">Find Work</h1>
      <p>Browse open positions across Rwanda — updated daily</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-7">
        <div className="md:col-span-2">
          <JobSearch />
        </div>
        <div className="md:col-span-5">
          <JobList />
        </div>
      </div>
    </div>
  );
}
