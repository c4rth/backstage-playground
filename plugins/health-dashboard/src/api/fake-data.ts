import { EnvironmentHealthData } from '../types';

export function dummyCall(): EnvironmentHealthData {
  const data = `
{
  "tst": {
    "AAAA": {
      "defl": "AAAA",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "x4q9-status.alpha-grid.dev/services/aaaa/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-v1d7-847b6f5f8c-g9pzr"
      }
    },
    "A7K2": {
      "defl": "A7K2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://x4q9-status.alpha-grid.dev/services/a7k2/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-v1d7-847b6f5f8c-g9pzr"
      }
    },
    "M3P8": {
      "defl": "M3P8",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 202,
      "healthUrl": "https://node77.ops-lane.io/apps/m3p8/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "16/03/2026 21:18:09",
        "server": "svc-m3p8-5f78c7d4c8-k2hqp"
      }
    },
    "Q9W1": {
      "defl": "Q9W1",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://api2.skybridge.net/tenant/q9w1/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-q9w1-5f78c7d4c8-k2hqp"
      }
    },
    "Z4N6": {
      "defl": "Z4N6",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://gw19.red-harbor.com/cluster/z4n6/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-z4n6-5f78c7d4c8-k2hqp"
      }
    },
    "B2T5": {
      "defl": "B2T5",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://probe.kitefield.org/runtime/b2t5/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 07:33:51",
        "server": "svc-b2t5-6b9d8f5c6b-vm9nd"
      }
    },
    "H8R3": {
      "defl": "H8R3",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://edge12.delta-farm.app/health/h8r3/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-h8r3-5f78c7d4c8-k2hqp"
      }
    },
    "L5C9": {
      "defl": "L5C9",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://mesh.corelane.tech/pods/l5c9/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-l5c9-5f78c7d4c8-k2hqp"
      }
    },
    "V1D7": {
      "defl": "V1D7",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://status.orange-ridge.dev/sites/v1d7/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-v1d7-847b6f5f8c-g9pzr"
      }
    },
    "N6X4": {
      "defl": "N6X4",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://ops.blue-crest.net/env/n6x4/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-n6x4-5f78c7d4c8-k2hqp"
      }
    },
    "R3F0": {
      "defl": "R3F0",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://gateway.peakline.cloud/services/r3f0/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 08:01:12",
        "server": "svc-r3f0-5f78c7d4c8-k2hqp"
      }
    },
    "C8M1": {
      "defl": "C8M1",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://api.delta-circuit.net/services/c8m1/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 09:44:03",
        "server": "svc-c8m1-7d94f6b8f6-bt9cn"
      }
    },
    "P4L7": {
      "defl": "P4L7",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://edge.green-node.io/runtime/p4l7/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "T9Q2": {
      "defl": "T9Q2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://mesh.bluelane.app/cluster/t9q2/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "K6R4": {
      "defl": "K6R4",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://ops.sunharbor.dev/env/k6r4/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "D2X9": {
      "defl": "D2X9",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://status.silver-fleet.cloud/apps/d2x9/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 09:17:28",
        "server": "svc-d2x9-6f58b8c9f9-j4nzs"
      }
    },
    "W1F3": {
      "defl": "W1F3",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://gateway.redline.tech/services/w1f3/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "Y7N5": {
      "defl": "Y7N5",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://node31.cloudframe.org/pods/y7n5/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "G3V8": {
      "defl": "G3V8",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://platform.ocean-grid.net/tenant/g3v8/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "J5S6": {
      "defl": "J5S6",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://health.prime-core.io/system/j5s6/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 09:55:41",
        "server": "svc-j5s6-5d9b7f66d8-zx2qk"
      }
    },
    "U0H2": {
      "defl": "U0H2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://probe.crystal-net.dev/runtime/u0h2/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "E4K9": {
      "defl": "E4K9",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://runtime.nova-grid.dev/apps/e4k9/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 10:01:14",
        "server": "svc-e4k9-66f7f6d9c7-v2kmd"
      }
    },
    "S2B4": {
      "defl": "S2B4",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://gateway.horizon-lab.io/services/s2b4/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "F9T1": {
      "defl": "F9T1",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://mesh.iron-bridge.app/tenant/f9t1/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "X6P3": {
      "defl": "X6P3",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://edge.steel-cloud.net/cluster/x6p3/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "I8D5": {
      "defl": "I8D5",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://status.lumen-core.org/services/i8d5/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 09:58:22",
        "server": "svc-i8d5-74b8c7c9ff-k8qtp"
      }
    },
    "O3W7": {
      "defl": "O3W7",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://probe.delta-harbor.dev/runtime/o3w7/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "R8L2": {
      "defl": "R8L2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://platform.quartz-grid.io/apps/r8l2/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "B7Y0": {
      "defl": "B7Y0",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://ops.sunfield.cloud/env/b7y0/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "N1C6": {
      "defl": "N1C6",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://api.skyline-node.tech/services/n1c6/actuator/health",
      "status": {
        "service": "Service OK",
        "started": "17/03/2026 10:06:37",
        "server": "svc-n1c6-6dd8c6f8c9-r4xgz"
      }
    },
    "Q2M8": {
      "defl": "Q2M8",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://gateway.blueforge.dev/services/q2m8/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    }
  },
  "gtu": {
    "A7K2": {
      "defl": "A7K2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://x4q9-status.alpha-grid.dev/services/a7k2/actuator/health",
      "status": {
        "service": "Service OK (PRD)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-a7k2-prd"
      }
    },
    "M3P8": {
      "defl": "M3P8",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://node77.ops-lane.io/apps/m3p8/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "Q9W1": {
      "defl": "Q9W1",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://api2.skybridge.net/tenant/q9w1/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "Z4N6": {
      "defl": "Z4N6",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://gw19.red-harbor.com/cluster/z4n6/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "B2T5": {
      "defl": "B2T5",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://probe.kitefield.org/runtime/b2t5/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    },
    "H8R3": {
      "defl": "H8R3",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://edge12.delta-farm.app/health/h8r3/actuator/health",
      "status": {
        "service": "Service OK (PRD)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-h8r3-prd"
      }
    },
    "L5C9": {
      "defl": "L5C9",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://mesh.corelane.tech/pods/l5c9/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "V1D7": {
      "defl": "V1D7",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://status.orange-ridge.dev/sites/v1d7/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "N6X4": {
      "defl": "N6X4",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://ops.blue-crest.net/env/n6x4/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "R3F0": {
      "defl": "R3F0",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://gateway.peakline.cloud/services/r3f0/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    }
  },
  "uat": {
    "A7K2": {
      "defl": "A7K2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://x4q9-status.alpha-grid.dev/services/a7k2/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "M3P8": {
      "defl": "M3P8",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://node77.ops-lane.io/apps/m3p8/actuator/health",
      "status": {
        "service": "Service OK (UAT)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-m3p8-uat"
      }
    },
    "Q9W1": {
      "defl": "Q9W1",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://api2.skybridge.net/tenant/q9w1/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "Z4N6": {
      "defl": "Z4N6",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://gw19.red-harbor.com/cluster/z4n6/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "B2T5": {
      "defl": "B2T5",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://probe.kitefield.org/runtime/b2t5/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    },
    "H8R3": {
      "defl": "H8R3",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://edge12.delta-farm.app/health/h8r3/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "L5C9": {
      "defl": "L5C9",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://mesh.corelane.tech/pods/l5c9/actuator/health",
      "status": {
        "service": "Service OK (UAT)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-l5c9-uat"
      }
    },
    "V1D7": {
      "defl": "V1D7",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://status.orange-ridge.dev/sites/v1d7/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "N6X4": {
      "defl": "N6X4",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://ops.blue-crest.net/env/n6x4/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "R3F0": {
      "defl": "R3F0",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://gateway.peakline.cloud/services/r3f0/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    }
  },
  "ptp": {
    "A7K2": {
      "defl": "A7K2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://x4q9-status.alpha-grid.dev/services/a7k2/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "M3P8": {
      "defl": "M3P8",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://node77.ops-lane.io/apps/m3p8/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    },
    "Q9W1": {
      "defl": "Q9W1",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://api2.skybridge.net/tenant/q9w1/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "Z4N6": {
      "defl": "Z4N6",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://gw19.red-harbor.com/cluster/z4n6/actuator/health",
      "status": {
        "service": "Service OK (PTP)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-z4n6-ptp"
      }
    },
    "B2T5": {
      "defl": "B2T5",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://probe.kitefield.org/runtime/b2t5/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "H8R3": {
      "defl": "H8R3",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://edge12.delta-farm.app/health/h8r3/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "L5C9": {
      "defl": "L5C9",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://mesh.corelane.tech/pods/l5c9/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    },
    "V1D7": {
      "defl": "V1D7",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://status.orange-ridge.dev/sites/v1d7/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "N6X4": {
      "defl": "N6X4",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://ops.blue-crest.net/env/n6x4/actuator/health",
      "status": {
        "service": "Service OK (PTP)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-n6x4-ptp"
      }
    },
    "R3F0": {
      "defl": "R3F0",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://gateway.peakline.cloud/services/r3f0/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    }
  },
  "prd": {
    "A7K2": {
      "defl": "A7K2",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://x4q9-status.alpha-grid.dev/services/a7k2/actuator/health",
      "status": {
        "service": "Service OK (PRD)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-a7k2-prd"
      }
    },
    "M3P8": {
      "defl": "M3P8",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://node77.ops-lane.io/apps/m3p8/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "Q9W1": {
      "defl": "Q9W1",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://api2.skybridge.net/tenant/q9w1/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    },
    "Z4N6": {
      "defl": "Z4N6",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://gw19.red-harbor.com/cluster/z4n6/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "B2T5": {
      "defl": "B2T5",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://probe.kitefield.org/runtime/b2t5/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    },
    "H8R3": {
      "defl": "H8R3",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": true,
      "returnedHttpStatus": 200,
      "healthUrl": "https://edge12.delta-farm.app/health/h8r3/actuator/health",
      "status": {
        "service": "Service OK (PRD)",
        "started": "17-03-2026 10:12:45",
        "server": "svc-h8r3-prd"
      }
    },
    "L5C9": {
      "defl": "L5C9",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 404,
      "healthUrl": "https://mesh.corelane.tech/pods/l5c9/actuator/health",
      "status": {
        "errorMessage": "404 NOT_FOUND"
      }
    },
    "V1D7": {
      "defl": "V1D7",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 502,
      "healthUrl": "https://status.orange-ridge.dev/sites/v1d7/actuator/health",
      "status": {
        "errorMessage": "502 BAD_GATEWAY"
      }
    },
    "N6X4": {
      "defl": "N6X4",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 503,
      "healthUrl": "https://ops.blue-crest.net/env/n6x4/actuator/health",
      "status": {
        "errorMessage": "503 SERVICE_UNAVAILABLE"
      }
    },
    "R3F0": {
      "defl": "R3F0",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 500,
      "healthUrl": "https://gateway.peakline.cloud/services/r3f0/actuator/health",
      "status": {
        "errorMessage": "500 INTERNAL_SERVER_ERROR"
      }
    }
  }
}
  `;
  return JSON.parse(data) as EnvironmentHealthData;
}
