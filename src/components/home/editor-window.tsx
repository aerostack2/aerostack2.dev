import { highlight } from "fumadocs-core/highlight";
import { ChevronRight, FileCode, FileText, Folder } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * A code editor drawn in HTML, with the quickstart
 * project open on `mission.py`. The files are the ones the quickstart page
 * lists for project_as2_multirotor_simulator.
 */
const files = [
  { name: "config", folder: true },
  { name: "trees", folder: true },
  { name: "launch_as2.bash" },
  { name: "launch_ground_station.bash" },
  { name: "mission.py", active: true },
  { name: "mission_behavior_tree.py" },
  { name: "mission_gps.py" },
  { name: "mission_interpreter.py" },
  { name: "mission_swarm.py" },
  { name: "stop.bash" },
];

const missionCode = `import rclpy
from as2_python_api.drone_interface import DroneInterface

rclpy.init()
drone = DroneInterface(drone_id="drone0", use_sim_time=True)

drone.arm()
drone.offboard()
drone.takeoff(height=1.0, speed=0.5)
drone.go_to(3.0, 0.0, 1.0, speed=1.0)
drone.go_to(3.0, 3.0, 1.0, speed=1.0)
drone.land(speed=0.5)

drone.shutdown()
rclpy.shutdown()`;

export async function EditorWindow({ className }: { className?: string }) {
  const code = await highlight(missionCode, {
    lang: "python",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <div
      className={cn(
        "home-editor overflow-hidden rounded-xl border border-fd-border bg-fd-background font-mono text-[0.78rem] shadow-2xl shadow-black/10",
        className,
      )}
    >
      <div className="flex h-9 items-center gap-3 border-b border-fd-border bg-fd-card px-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-fd-border" />
          <span className="size-2.5 rounded-full bg-fd-border" />
          <span className="size-2.5 rounded-full bg-fd-border" />
        </div>
        <span className="truncate text-xs text-fd-muted-foreground">
          project_as2_multirotor_simulator
        </span>
      </div>

      <div className="grid sm:grid-cols-[190px_minmax(0,1fr)]">
        <ul className="hidden border-e border-fd-border bg-fd-card py-2 text-xs sm:block">
          {files.map((file) => (
            <li
              key={file.name}
              className={cn(
                "flex h-6 items-center gap-1.5 truncate px-2 text-fd-muted-foreground [&_svg]:size-3.5 [&_svg]:shrink-0",
                file.active && "bg-fd-accent text-fd-foreground",
              )}
            >
              {file.folder ? (
                <>
                  <ChevronRight />
                  <Folder />
                </>
              ) : (
                <>
                  <span className="w-3.5 shrink-0" />
                  {file.name.endsWith(".py") ? <FileCode /> : <FileText />}
                </>
              )}
              <span className="truncate">{file.name}</span>
            </li>
          ))}
        </ul>

        <div className="min-w-0">
          <div className="flex h-8 border-b border-fd-border bg-fd-card text-xs">
            <span className="flex items-center border-e border-fd-border bg-fd-background px-3 shadow-[inset_0_1px_0_var(--color-fd-primary)]">
              mission.py
            </span>
            <span className="flex items-center px-3 text-fd-muted-foreground">
              mission_behavior_tree.py
            </span>
          </div>
          <div className="overflow-x-auto py-3">{code}</div>
        </div>
      </div>

      <div className="border-t border-fd-border">
        <div className="flex h-8 items-center gap-4 border-b border-dashed border-fd-border px-3 text-xs">
          <span>Terminal</span>
          <span className="text-fd-muted-foreground">drone0</span>
        </div>
        <p className="px-3 py-3 text-fd-muted-foreground">
          <span className="text-fd-primary">
            ~/project_as2_multirotor_simulator
          </span>{" "}
          <span className="text-fd-foreground">python3 mission.py</span>
          <span className="home-caret ms-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-fd-foreground" />
        </p>
      </div>
    </div>
  );
}
