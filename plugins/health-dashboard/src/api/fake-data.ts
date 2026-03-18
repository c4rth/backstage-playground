
import { EnvironmentHealthData } from "../types";

export function dummyCall(): EnvironmentHealthData {
    const data = `
{
  "tst": {
    "AAAA": {
      "defl": "AAAA",
      "lastRefresh": "17-03-2026 10:12:45",
      "applicationStarted": false,
      "returnedHttpStatus": 200,
      "healthUrl": "https://x4q9-status.alpha-grid.dev/services/aaaa/actuator/health",
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