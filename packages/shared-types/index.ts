export type HealthStatus = {
  status: "UP" | "DOWN" | "PARTIAL_DOWN";
  service: string;
  details?: Record<string, unknown>;
  timestamp: string;
};

export type ServiceHealth = {
  status: "UP" | "DOWN";
  service: string;
  details?: Record<string, unknown>;
  error?: string;
  timestamp: string;
};

export type AllServicesHealth = {
  status: "UP" | "DOWN" | "PARTIAL_DOWN";
  timestamp: string;
  services: Record<string, ServiceHealth>;
};

export type CommandSucceededWithId = {
  id: string;
};

export type CommandSucceededWithBool = {
  success: boolean;
};
export type AccessTokenPayload = {
  sub: string;
  email: string;
};
