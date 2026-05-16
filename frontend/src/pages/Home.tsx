import SideBarLayout from "@/layouts/SideBarLayout";
import { Card, CardContent } from "@/components/ui/card";
import { MigraineHeatmap } from "@/components/migraines/MigraineHeatmap";

const Home = () => {
  return (
    <SideBarLayout title="Home">
      <div className="flex flex-1 items-start justify-center p-4 sm:p-6 w-full overflow-x-hidden">
        <Card className="w-full">
          <CardContent>
            <MigraineHeatmap />
          </CardContent>
        </Card>
      </div>
    </SideBarLayout>
  );
};

export default Home;
