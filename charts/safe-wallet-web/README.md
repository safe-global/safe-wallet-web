# Safe Wallet Web Chart

This chart packages the Safe wallet web resources.

## Parameters

### Common parameters

| Name               | Description                                        | Value |
| ------------------ | -------------------------------------------------- | ----- |
| `nameOverride`     | String to partially override common.names.fullname | `""`  |
| `fullnameOverride` | String to fully override common.names.fullname     | `""`  |

### Installation Parameters

| Name                       | Description                                                      | Value                            |
| -------------------------- | ---------------------------------------------------------------- | -------------------------------- |
| `replicas`                 | Replicas for deployment                                          | `1`                              |
| `strategy`                 | Strategy for deployment                                          | `RollingUpdate`                  |
| `commonLabels`             | Labels to add to all related objects                             | `{}`                             |
| `commonAnnotations`        | Annotations to to all related objects                            | `{}`                             |
| `nodeSelector`             | Object containing node selection constraint to deployment        | `{}`                             |
| `resources`                | Resource specification to deployment                             | `{}`                             |
| `tolerations`              | Tolerations specifications to deployment                         | `[]`                             |
| `affinity`                 | Affinity specifications to deployment                            | `{}`                             |
| `image.registry`           | Docker registry to deployment                                    | `registry.hub.docker.com`        |
| `image.repository`         | Docker image repository to deployment                            | `safeglobal/safe-config-service` |
| `image.tag`                | Docker image tag to deployment                                   | `""`                             |
| `image.pullPolicy`         | Pull policy to deployment as deinfed in                          | `IfNotPresent`                   |
| `service.type`             | service type                                                     | `ClusterIP`                      |
| `service.ports.number`     | service port number                                              | `80`                             |
| `service.ports.name`       | service port name                                                | `nginx`                          |
| `service.sessionAffinity`  | Control where client requests go, to the same pod or round-robin | `None`                           |
| `service.socket.number`    | Number of the socket                                             | `8000`                           |
| `service.socket.name`      | Name of the socket                                               | `gunicorn`                       |
| `ingress.ingressClassName` | Name of the ingress class name to be used                        | `""`                             |
| `ingress.hostname`         | Default host for the ingress record                              | `safe.cluster.local`             |
| `ingress.annotations`      | Annotations to be added to ingress resources                     | `{}`                             |

### Config Service Parameters

| Name                                 | Description                                                                                                                                     | Value                                               |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `config.secretKey`                   | Config Service Secret Key. You should generate a random string of 50+ characters for this value in prod.                                        | `""`                                                |
| `config.extraEnvVars`                | Add additional extra environment vairables to the configMap                                                                                     | `{}`                                                |
| `config.cgw.url`                     | The Client Gateway URL. This is for triggering webhooks to invalidate its cache for example                                                     | `http://safe-client-gateway.safe.svc.cluster.local` |
| `config.cgw.webToken`                | Flush Token                                                                                                                                     | `""`                                                |
| `config.secretReferenceKey`          | Reference to an existing secret containing the following entries: SECRET_KEY, CGW_FLUSH_TOKEN                                                   | `""`                                                |
| `config.pythonDontWriteBytecode`     | pythonDontWriteBytecode                                                                                                                         | `true`                                              |
| `config.debug`                       | Enable debug                                                                                                                                    | `true`                                              |
| `config.rootLogLevel`                | Log Level                                                                                                                                       | `DEBUG`                                             |
| `config.django.allowedHosts`         | Allowed hosts                                                                                                                                   | `*`                                                 |
| `config.postgres.secretReferenceKey` | Reference to an existing secret containing the following entries: POSTGRES_HOST, POSTGRES_PORT, POSTGRES_NAME, POSTGRES_USER, POSTGRES_PASSWORD | `""`                                                |
| `config.postgres.username`           | PostgreSQL user                                                                                                                                 | `""`                                                |
| `config.postgres.password`           | PostgreSQL user's password                                                                                                                      | `""`                                                |
| `config.postgres.database`           | PostgreSQL database name                                                                                                                        | `safe-config`                                       |
| `config.postgres.host`               | PostgreSQL server host                                                                                                                          | `""`                                                |
| `config.postgres.port`               | PostgreSQL server port                                                                                                                          | `5432`                                              |
