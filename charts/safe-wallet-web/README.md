# Safe Wallet Web Chart

This chart packages the Safe wallet web resources.

## Parameters

### Common parameters

| Name               | Description                                        | Value |
| ------------------ | -------------------------------------------------- | ----- |
| `nameOverride`     | String to partially override common.names.fullname | `""`  |
| `fullnameOverride` | String to fully override common.names.fullname     | `""`  |

### Installation Parameters

| Name                       | Description                                                      | Value                             |
| -------------------------- | ---------------------------------------------------------------- | --------------------------------- |
| `replicas`                 | Replicas for deployment                                          | `1`                               |
| `strategy`                 | Strategy for deployment                                          | `RollingUpdate`                   |
| `commonLabels`             | Labels to add to all related objects                             | `{}`                              |
| `commonAnnotations`        | Annotations to to all related objects                            | `{}`                              |
| `nodeSelector`             | Object containing node selection constraint to deployment        | `{}`                              |
| `resources`                | Resource specification to deployment                             | `{}`                              |
| `tolerations`              | Tolerations specifications to deployment                         | `[]`                              |
| `affinity`                 | Affinity specifications to deployment                            | `{}`                              |
| `image.registry`           | Docker registry to deployment                                    | `gcr.io`                          |
| `image.repository`         | Docker image repository to deployment                            | `hoprassociation/safe-wallet-web` |
| `image.tag`                | Docker image tag to deployment                                   | `""`                              |
| `image.pullPolicy`         | Pull policy to deployment as deinfed in                          | `IfNotPresent`                    |
| `service.type`             | service type                                                     | `ClusterIP`                       |
| `service.ports.number`     | service port number                                              | `8080`                            |
| `service.ports.name`       | service port name                                                | `web`                             |
| `service.sessionAffinity`  | Control where client requests go, to the same pod or round-robin | `None`                            |
| `ingress.ingressClassName` | Name of the ingress class name to be used                        | `""`                              |
| `ingress.hostname`         | Default host for the ingress record                              | `safe-wallet.cluster.local`       |
| `ingress.annotations`      | Annotations to be added to ingress resources                     | `{}`                              |

### Config Service Parameters

| Name                        | Description                                                                                   | Value                                               |
| --------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `config.extraEnvVars`       | Add additional extra environment vairables to the configMap                                   | `{}`                                                |
| `config.gatewayUrl`         | The Client Gateway URL. This is for triggering webhooks to invalidate its cache for example   | `http://safe-client-gateway.safe.svc.cluster.local` |
| `config.secretReferenceKey` | Reference to an existing secret containing the following entries: SECRET_KEY, CGW_FLUSH_TOKEN | `""`                                                |
