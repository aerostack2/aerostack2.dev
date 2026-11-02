"use client";

import { Crosshair, Gauge, PlaneTakeoff, Workflow } from "lucide-react";
import {
  type FlowChannel,
  FlowDiagram,
  type FlowEdge,
  type FlowNode,
} from "./flow-diagram";

// Who publishes and subscribes to each channel comes from the topic names in
// as2_core/include/as2_core/names/topics.hpp and the packages that use them.

const nodes: FlowNode[] = [
  {
    id: "behaviors",
    x: 190,
    y: 0,
    title: "Behaviors",
    subtitle: "as2_behaviors_*",
    icon: Workflow,
  },
  {
    id: "controller",
    x: 0,
    y: 170,
    title: "Motion controller",
    subtitle: "as2_motion_controller",
    icon: Gauge,
  },
  {
    id: "estimator",
    x: 380,
    y: 170,
    title: "State estimator",
    subtitle: "as2_state_estimator",
    icon: Crosshair,
  },
  {
    id: "platform",
    x: 190,
    y: 340,
    title: "Aerial platform",
    subtitle: "as2_platform_*",
    icon: PlaneTakeoff,
  },
];

const edges: FlowEdge[] = [
  {
    id: "behaviors-controller",
    source: "behaviors",
    target: "controller",
    from: "left",
    to: "top",
    channel: "motion_reference",
    label: "motion_reference",
  },
  {
    id: "controller-platform",
    source: "controller",
    target: "platform",
    from: "bottom",
    to: "left",
    channel: "actuator_command",
    label: "actuator_command",
  },
  {
    id: "platform-estimator",
    source: "platform",
    target: "estimator",
    from: "right",
    to: "bottom",
    channel: "sensor_measurements",
    label: "sensor_measurements",
  },
  {
    id: "estimator-controller",
    source: "estimator",
    target: "controller",
    from: "left",
    to: "right",
    channel: "self_localization",
    label: "self_localization",
  },
  {
    id: "estimator-behaviors",
    source: "estimator",
    target: "behaviors",
    from: "top",
    to: "right",
    channel: "self_localization",
    label: "self_localization",
  },
];

const channels: Record<string, FlowChannel> = {
  motion_reference: {
    title: "Motion references",
    description:
      "Where the drone should be or how it should move. The motion controller reads them according to its current control mode.",
    topics: [
      "motion_reference/pose",
      "motion_reference/twist",
      "motion_reference/trajectory",
      "motion_reference/thrust",
    ],
    publishers: [
      "Motion behaviors",
      "Trajectory generation",
      "Motion reference handlers (Python API, teleoperation)",
    ],
    subscribers: ["Motion controller"],
  },
  actuator_command: {
    title: "Actuator commands",
    description:
      "The commands the controller computes, such as positions, speeds, or body rates and thrust, in a control mode the platform accepts.",
    topics: [
      "actuator_command/pose",
      "actuator_command/twist",
      "actuator_command/thrust",
      "actuator_command/trajectory",
    ],
    publishers: ["Motion controller"],
    subscribers: ["Aerial platform"],
  },
  sensor_measurements: {
    title: "Sensor measurements",
    description:
      "Raw sensor data from the drone. Simulators also publish the true pose on ground_truth/*.",
    topics: [
      "sensor_measurements/odom",
      "sensor_measurements/imu",
      "sensor_measurements/gps",
      "sensor_measurements/camera",
      "sensor_measurements/lidar",
      "sensor_measurements/battery",
      "ground_truth/pose",
      "ground_truth/twist",
    ],
    publishers: ["Aerial platform", "Sensor drivers", "Gazebo bridges"],
    subscribers: ["State estimator", "Perception behaviors", "Map server"],
  },
  self_localization: {
    title: "Self localization",
    description:
      "Where the drone is and how fast it moves. The state estimator also publishes the TF tree, which is the preferred way to read the pose.",
    topics: ["self_localization/pose", "self_localization/twist", "/tf"],
    publishers: ["State estimator"],
    subscribers: ["Motion controller", "Behaviors", "User interfaces"],
  },
};

export function ControlLoopDiagram() {
  return (
    <FlowDiagram
      nodes={nodes}
      edges={edges}
      channels={channels}
      aspectRatio={4 / 3}
      ariaLabel="In the Aerostack2 control loop, behaviors send motion references to the motion controller, which sends actuator commands to the aerial platform. The platform publishes sensor measurements to the state estimator, which publishes self localization back to the controller and the behaviors."
    />
  );
}
