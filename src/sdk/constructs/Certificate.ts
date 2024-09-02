import { Construct } from "./Construct.js";

interface CertificateProps {
  domains: string[];
  acmeDnsConfigured?: boolean;
  acmeAlpnConfigured?: boolean;
  certificateAuthority?: string;
  dnsProvider?: string;
  dnsValidationInstructions?: string;
  dnsValidationHostname?: string;
  dnsValidationTarget?: string;
  source?: string;
}

export class Certificate extends Construct {
  public readonly domains: string[];
  public readonly acmeDnsConfigured?: boolean;
  public readonly acmeAlpnConfigured?: boolean;
  public readonly certificateAuthority?: string;
  public readonly dnsProvider?: string;
  public readonly dnsValidationInstructions?: string;
  public readonly dnsValidationHostname?: string;
  public readonly dnsValidationTarget?: string;
  public readonly source?: string;

  constructor(scope: Construct, id: string, props: CertificateProps) {
    super(scope, id);

    this.domains = props.domains;
    this.acmeDnsConfigured = props.acmeDnsConfigured;
    this.acmeAlpnConfigured = props.acmeAlpnConfigured;
    this.certificateAuthority = props.certificateAuthority;
    this.dnsProvider = props.dnsProvider;
    this.dnsValidationInstructions = props.dnsValidationInstructions;
    this.dnsValidationHostname = props.dnsValidationHostname;
    this.dnsValidationTarget = props.dnsValidationTarget;
    this.source = props.source;
  }

  // Add any methods needed to interact with the Fly.io API
}