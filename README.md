# ACE (Automated Cloud Environment)

## Introduction

ACE (Automated Cloud Environment) is a powerful SDK for managing and deploying applications to Fly.io. It provides a high-level, declarative way to define your infrastructure and applications, making it easy to create, update, and manage your Fly.io resources.

## Philosophy

ACE embraces the philosophy of "serverless" in the sense that you shouldn't need to worry about servers, unless you need to. By providing a flexible and powerful way to define infrastructure, whether you need a simple VM or a complex application, ACE has you covered.

## Example

Deploy a remix website.

```typescript
import { FlyStack } from "./sdk/core/FlyStack";
import { RemixSite } from "./sdk/constructs/RemixConstruct";

const RemixDeployment = new RemixSite(new FlyStack(), "remix-site", {
    name: "Awesome Website",
    domain: "awesome.website",
    env: {
        NODE_ENV: "production",
    }
});

const deployment = await RemixDeployment.deploy();

```

### SDK & Constructs

Constructs are the building blocks of ACE. They are used to define your infrastructure and applications.
Currently, ACE has the following constructs, for building applicaitons on Fly.io:

#### Core Constructs

- [StackConstruct](src/sdk/constructs/StackConstruct.ts)
- [FlyOrg](src/sdk/constructs/FlyOrg.ts)
- [FlyApp](src/sdk/constructs/FlyApp.ts)

#### Resources

- [FlyProxy](src/sdk/constructs/FlyProxy.ts)
- [FlyMachine](src/sdk/constructs/FlyMachine.ts)
- [FlyPostgres](src/sdk/constructs/FlyPostgres.ts)
- [FlyAnycastIP](src/sdk/constructs/FlyAnycastIP.ts)
- [FlyCertificate](src/sdk/constructs/FlyCertificate.ts)
- [FlyDomain](src/sdk/constructs/FlyDomain.ts)

#### Configs

- [FlyAutoScalingConfig](src/sdk/constructs/FlyAutoScalingConfig.ts)
- [FlyMachineConfig](src/sdk/constructs/FlyMachineConfig.ts)
- [FlyPostgresReplica](src/sdk/constructs/FlyPostgresReplica.ts)
- [FlySecret](src/sdk/constructs/FlySecret.ts)
- [FlyVolume](src/sdk/constructs/FlyVolume.ts)
- [FlyLBConfig](src/sdk/constructs/FlyLBConfig.ts)
- [TlsConfig](src/sdk/constructs/TlsConfig.ts)

These can be composed together to create a fully featured applications.

Examples can be found, including a robist full-stack app in the [examples](src/examples) directory.

### Other Parts of ACE

#### CLI

The CLI is a command-line interface for ACE. It is used to create, update, and manage your infrastructure and applications.

#### Local Development 

ACE has a local development dashboard that allows you to develop your application locally. It is built using [Remix](https://remix.run/) and runs locally in your browser.

#### The Backend Service the Runs Deployments

 ACE has a backend service that is responsible for running deployments. This is a Node.js application that is deployed to Fly.io. It is responsible for creating and managing your infrastructure and applications.
 It is built using [Remix](https://remix.run/) and [Supabase](https://supabase.com/) and deployed to Fly.io.

#### Credit
This project is shamelessly inspired by: [https://sst.dev/](https://sst.dev/)
