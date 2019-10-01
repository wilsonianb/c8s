# Codiusless (c8s) Host
> c8s is the hosting component of serverless Codius

[![CircleCI](https://circleci.com/gh/codius/c8s.svg?style=shield)](https://circleci.com/gh/codius/c8s)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Known Vulnerabilities](https://snyk.io/test/github/codius/c8s/badge.svg?targetFile=package.json)](https://snyk.io/test/github/codius/c8s?targetFile=package.json)
[![Gitter chat](https://badges.gitter.im/codius/services.png)](https://gitter.im/codius/codius-chat)


[Codius](https://codius.org) is an open-source decentralized hosting platform using [Interledger](https://interledger.org) (ILP). It allows anyone to run software on servers all over the world and pay using any currency. Users package their software inside of [containers](https://www.docker.com/what-container).

**c8s** (this software) is the serverless hosting component. You can run c8s in your [Kubernetes](https://kubernetes.io/) (k8s) cluster and users will pay you via [Web Monetization](https://webmonetization.org/) to run their serverless, request-triggered software. c8s uses [Kata Containers](https://katacontainers.io/) to provide hardware-level isolation between different containers. Network isolation can be achieved with Kubernetes [network policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) using a plugin like [Calico](https://www.projectcalico.org/).

## Prerequisites

* CentOS 7 or higher
* A processor with [virtualization support](https://wiki.centos.org/HowTos/KVM#head-6cbcdf8f149ebcf19d53199a30eb053a9fc482db)

## Installation

c8s is designed to run within your Kubernetes cluster. It can run as a [Knative](https://knative.dev/) service, however you will need to configure the cluster routing to send subdomain requests to c8s.

c8s must run with a [service account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) bound to the following [role and cluster role](https://kubernetes.io/docs/reference/access-authn-authz/rbac/):

```
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: c8s
  namespace: c8s-untrusted # see CODIUS_K8S_NAMESPACE below
rules:
- apiGroups: ["serving.knative.dev"]
  resources: ["services"]
  verbs: ["create", "watch"]
```

```
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: c8s
rules:
- apiGroups: ["apiextensions.k8s.io"]
  resources: ["customresourcedefinitions"]
  verbs: ["get"]
```

You can use the [c8s installer](https://github.com/wilsonianb/codius-install/tree/c8s) to run a local Kubernetes cluster with c8s.

### Environment Variables

#### CODIUS_PORT
* Type: [Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)
* Description: The port that c8s will listen on.
* Default: 3000

#### CODIUS_PUBLIC_URI
* Type: String
* Description: The public URI resolving to this instance of c8s.
* Default: `http://local.codius.org:CODIUS_PORT`

#### CODIUS_BIND_IP
* Type: String
* Description: The IP address the server will listen on.
* Default: `127.0.0.1`

#### CODIUS_PAYMENT_POINTER
* Type: String
* Description: Interledger [payment pointer](https://interledger.org/rfcs/0026-payment-pointers/) at which to receive payments.

#### CODIUS_K8S_NAMESPACE
* Type: String
* Description: Kubernetes [namespace](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/) in which to deploy user containers
* Default: 'default'

#### CODIUS_K8S_SERVICE_ACCOUNT
* Type: String
* Description: Kubernetes [service account](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/) used for deployed user containers
* Default: 'default'

## License

Apache-2.0
