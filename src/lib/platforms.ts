/**
 * Platforms shown on the home page, in the logo strip and the navbar's
 * Platforms menu. Descriptions follow the table on the aerial platforms
 * overview page.
 *
 * Logos live in `public/logos` as one-colour silhouettes: only their alpha is
 * used, as a CSS mask, so they take the text colour in both themes. Sizes are
 * set by eye so the marks carry similar visual weight. Platforms without a
 * logo show their name as a wordmark. The multirotor simulator has no logo of
 * its own, so it gets a drawn mark beside its name (see PlatformLogo).
 */
export interface Platform {
  name: string;
  description: string;
  href: string;
  logo?: { src: string; width: number; height: number };
  /** A mark drawn on the site, set beside the name. */
  mark?: "simulator";
}

export const platforms: Platform[] = [
  {
    name: "Gazebo",
    description: "Simulated drones in 3D worlds with sensors",
    href: "/docs/aerial-platforms/gazebo-simulation",
    logo: { src: "/logos/gazebo.svg", width: 116, height: 29 },
  },
  {
    name: "Multirotor Sim",
    description: "A lightweight simulated multirotor",
    href: "/docs/aerial-platforms/multirotor-simulator",
    mark: "simulator",
  },
  {
    name: "PX4 Autopilot",
    description: "Drones with a PX4 autopilot",
    href: "/docs/aerial-platforms/pixhawk",
    logo: { src: "/logos/px4.svg", width: 72, height: 34 },
  },
  {
    name: "MAVLink",
    description: "Autopilots that speak MAVLink, through MAVROS",
    href: "/docs/aerial-platforms/mavlink",
    logo: { src: "/logos/mavlink.png", width: 120, height: 23 },
  },
  {
    name: "Crazyflie by Bitcraze",
    description: "Bitcraze Crazyflie nano quadcopters",
    href: "/docs/aerial-platforms/crazyflie",
    logo: { src: "/logos/bitcraze.png", width: 112, height: 28 },
  },
  {
    name: "DJI",
    description: "DJI drones through the Onboard and Payload SDKs",
    href: "/docs/aerial-platforms/dji-osdk",
    logo: { src: "/logos/dji.svg", width: 44, height: 44 },
  },
  {
    name: "Ryze Tello",
    description: "The DJI Tello over Wi-Fi",
    href: "/docs/aerial-platforms/ryze-tello",
    logo: { src: "/logos/ryze.svg", width: 104, height: 21 },
  },
  {
    name: "Betaflight",
    description: "Flight controllers running Betaflight, over MSP",
    href: "/docs/aerial-platforms/betaflight",
    logo: { src: "/logos/betaflight.svg", width: 140, height: 18 },
  },
];
