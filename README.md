# Seminar 12: Implementing Monitoring and Observability with Pino, Prometheus, and Grafana

In this seminar, you will enhance the Finance Manager application by implementing comprehensive monitoring and observability capabilities. This will allow you to gain insights into your application's performance, track errors, and visualize metrics in real-time.

## Background

Monitoring and observability are critical aspects of modern application development. They help developers understand how an application is performing, identify bottlenecks, track errors, and make data-driven decisions for improvements.

We'll implement three key components:

1. **Logging**: Using Pino for structured, high-performance logging
2. **Metrics Collection**: Using Prometheus to collect and expose application metrics
3. **Visualization**: Using Grafana to create dashboards and visualize metrics

## Objective

Integrate a complete monitoring and observability stack into the Finance Manager application to:

1. Implement structured logging with Pino
2. Set up metrics collection with Prometheus
3. Create visualization dashboards with Grafana
4. Configure all components to work together within Docker Compose

## Instructions

### 1. Install and Setup nestjs-pino 

Install [nestjs-pino](https://www.npmjs.com/package/nestjs-pino), do the basic setup. You should have logging setup now.


### 2. Install and Setup Prometheus Metrics

Install [nestjs-prometheus](https://www.npmjs.com/package/@willsoto/nestjs-prometheus).

1. Create custom metrics for important application events. Create a new file `src/infrastructure/metrics/metrics.service.ts`:

```typescript
// src/infrastructure/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Gauge, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly requestDurationHistogram: Histogram<string>,
    
    @InjectMetric('active_users')
    private readonly activeUsersGauge: Gauge<string>,
    
    @InjectMetric('account_creation_total')
    private readonly accountCreationCounter: Counter<string>,
    
    @InjectMetric('transaction_total')
    private readonly transactionCounter: Counter<string>,
  ) {}

  // Track request duration
  trackRequestDuration(route: string, method: string, statusCode: number, duration: number): void {
    this.requestDurationHistogram.observe(
      { route, method, statusCode: statusCode.toString() },
      duration,
    );
  }

  // Track active users
  setActiveUsers(count: number): void {
    this.activeUsersGauge.set(count);
  }

  // Increment account creation counter
  incrementAccountCreation(accountType: string): void {
    this.accountCreationCounter.inc({ accountType });
  }

  // Increment transaction counter
  incrementTransaction(type: string): void {
    this.transactionCounter.inc({ type });
  }
}
```

2. Create a metrics module in `src/infrastructure/metrics/metrics.module.ts`:

```typescript
// src/infrastructure/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['route', 'method', 'statusCode'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    }),
    makeGaugeProvider({
      name: 'active_users',
      help: 'Number of active users',
    }),
    makeCounterProvider({
      name: 'account_creation_total',
      help: 'Total number of accounts created',
      labelNames: ['accountType'],
    }),
    makeCounterProvider({
      name: 'transaction_total',
      help: 'Total number of transactions',
      labelNames: ['type'],
    }),
    MetricsService,
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
```

3. Import the MetricsModule in the AppModule:

```typescript
// src/app.module.ts
// ...other imports
import { MetricsModule } from './infrastructure/metrics/metrics.module';

@Module({
  imports: [
    // ...other imports
    MetricsModule,
  ],
  // ...
})
export class AppModule {}
```

### 4. Create Prometheus Configuration

Create a `prometheus.yml` file in the root of your project:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
   - job_name: nestjs-service
     scrape_interval: 15s
     scrape_timeout: 10s
     metrics_path: /metrics
     static_configs:
      - targets:
          - 'prometheus:9090'
          - 'finance-manager:8000'
```

### 5. Set Up Grafana Dashboard Configuration

1. Create a `Datasource.yml` file in the root of your project:

```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    orgId: 1
    url: http://prometheus:9090
    basicAuth: false
    isDefault: true
    editable: true
```

2. Create a Grafana directory and provisioning subdirectory:

```bash
mkdir -p grafana/provisioning/dashboards
```

3. Create a dashboard configuration file in `grafana/provisioning/dashboards/dashboard.yml`:

```yaml
apiVersion: 1

providers:
  - name: 'Finance Manager'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

4. Create a sample dashboard JSON file in `grafana/provisioning/dashboards/finance-manager-dashboard.json`:

```json
{
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "grafana",
          "uid": "-- Grafana --"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "target": {
          "limit": 100,
          "matchAny": false,
          "tags": [],
          "type": "dashboard"
        },
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "links": [],
  "liveNow": false,
  "panels": [
    {
      "datasource": {
        "type": "prometheus",
        "uid": "PBFA97CFB590B2093"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 0
      },
      "id": 2,
      "options": {
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "title": "HTTP Request Duration",
      "type": "timeseries"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "PBFA97CFB590B2093"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 0
      },
      "id": 4,
      "options": {
        "orientation": "auto",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "showThresholdLabels": false,
        "showThresholdMarkers": true
      },
      "pluginVersion": "9.3.8",
      "title": "Active Users",
      "type": "gauge"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "PBFA97CFB590B2093"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            }
          },
          "mappings": []
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 0,
        "y": 8
      },
      "id": 6,
      "options": {
        "legend": {
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "pieType": "pie",
        "reduceOptions": {
          "calcs": [
            "lastNotNull"
          ],
          "fields": "",
          "values": false
        },
        "tooltip": {
          "mode": "single",
          "sort": "none"
        }
      },
      "title": "Account Types",
      "type": "piechart"
    },
    {
      "datasource": {
        "type": "prometheus",
        "uid": "PBFA97CFB590B2093"
      },
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "fillOpacity": 80,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "lineWidth": 1,
            "scaleDistribution": {
              "type": "linear"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 8,
        "w": 12,
        "x": 12,
        "y": 8
      },
      "id": 8,
      "options": {
        "barWidth": 0.5,
        "groupWidth": 0.7,
        "legend": {
          "calcs": [],
          "displayMode": "list",
          "placement": "bottom",
          "showLegend": true
        },
        "orientation": "auto",
        "showValue": "auto",
        "stacking": "none",
        "tooltip": {
          "mode": "single",
          "sort": "none"
        },
        "xTickLabelRotation": 0,
        "xTickLabelSpacing": 0
      },
      "targets": [
        {
          "datasource": {
            "type": "prometheus",
            "uid": "PBFA97CFB590B2093"
          },
          "editorMode": "code",
          "expr": "transaction_total",
          "legendFormat": "{{type}}",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "Transactions by Type",
      "type": "barchart"
    }
  ],
  "refresh": "",
  "schemaVersion": 37,
  "style": "dark",
  "tags": [],
  "templating": {
    "list": []
  },
  "time": {
    "from": "now-6h",
    "to": "now"
  },
  "timepicker": {},
  "timezone": "",
  "title": "Finance Manager Dashboard",
  "uid": "finance-manager",
  "version": 1,
  "weekStart": ""
}
```

### 6. Update Docker Compose Configuration

Update your `docker-compose.yml` file to include Prometheus and Grafana:

```yaml
services:
  # Existing services like postgres, pgadmin, etc.
  
  prometheus:
    image: prom/prometheus
    container_name: prometheus
    ports:
      - "9095:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    networks:
      - app-network

  grafana:
    image: grafana/grafana
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana-data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./Datasource.yml:/etc/grafana/provisioning/datasources/datasource.yml
    networks:
      - app-network
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  # Other volumes
  grafana-data:
```

### 7. Integrate Metrics into Your Application Code

Now, use the MetricsService in your application. For example, update the AccountsController to track account creation:

```typescript
// src/modules/accounts/api/controllers/accounts.controller.ts
import { MetricsService } from '../../../../infrastructure/metrics/metrics.service';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly metricsService: MetricsService,
  ) {}

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @User() user: RequestUser,
  ): Promise<Account> {
    const result = await this.commandBus.execute(
      new CreateAccountCommand(
        createAccountDto.name,
        createAccountDto.accountType,
        user.id,
        createAccountDto.balance,
      ),
    );
    
    // Track account creation in metrics
    this.metricsService.incrementAccountCreation(createAccountDto.accountType);
    
    return result;
  }
  
  // Other methods...
}
```

### 8. Create Middleware for HTTP Request Monitoring

Create a middleware to track HTTP request durations:

```typescript
// src/infrastructure/middleware/metrics.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000; // Convert to seconds
      
      // Get route path, remove params like :id with their values
      let route = req.route ? req.route.path : req.path;
      
      this.metricsService.trackRequestDuration(
        route,
        req.method,
        res.statusCode,
        duration,
      );
    });
    
    next();
  }
}
```

Add the middleware to your application:

```typescript
// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MetricsMiddleware } from './infrastructure/middleware/metrics.middleware';

@Module({
  // ... existing configuration
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
```

## Testing Your Implementation

1. Start the application with Docker Compose:

```bash
docker-compose up 
```

2. Generate some traffic by using the application (create accounts, perform transactions)

3. Access the monitoring tools:
   - Prometheus: http://localhost:9095
   - Grafana: http://localhost:3001 (login with admin/admin)

4. In Grafana, navigate to the Finance Manager Dashboard to see your metrics visualized

## Bonus Tasks

1. **Add Custom Pino Transport**: Configure Pino to send logs to Elasticsearch or another centralized logging system

2. **Create Custom Metrics**: Add additional metrics specific to your application domain

3. **Implement Alerting**: Set up Grafana alerts to notify you when certain thresholds are exceeded

4. **Health Check Integration**: Create a comprehensive health check system that reports to your monitoring stack

## Resources

- [Pino Logger Documentation](https://github.com/pinojs/pino)
- [nestjs-pino Documentation](https://github.com/iamolegga/nestjs-pino)
- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [nestjs-prometheus Documentation](https://github.com/willsoto/nestjs-prometheus)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
