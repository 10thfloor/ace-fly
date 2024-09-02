#Problems with traditional IaC

Traditional IaC, like the Terraform and Pulumi, are made up of low level resources. This has a couple of implications:

You need to understand how each of these low level resources work. You need to know what the properties of a resource does.

You need a lot of these low level resources. For example, to deploy a Next.js app on Fly.io, you need a bunch of these low-level resources.

This makes IaC really intimidating for most developers. Since you need very specific Fly.io knowledge to even deploy a simple CRUD app. As a result, IaC has been traditionally only used by DevOps or Platform engineers.

Additionally, traditional IaC tools don’t help you with local development. They are only concerned with how you define and deploy your infrastructure.

To fix this, we created ACE