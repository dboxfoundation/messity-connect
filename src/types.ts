export interface ConnectRequest {
  senderName: string;
  senderPrincipal: string;
}

export interface ConnectResponseSuccess {
  kind: "connect-success";
  aliasPrincipal: string;
}

interface ConnectResponseError {
  kind: "connect-error";
  error: string;
}

interface ConnectResponseReady {
  kind: "connect-ready";
}

export type ConnectResponse =
  | ConnectResponseSuccess
  | ConnectResponseError
  | ConnectResponseReady;

export interface ConnectOptions {
  senderName: string;
  senderPrincipal: string;
  messityUrl?: string;
  onSuccess?:
    | ((aliasPrincipal: string) => void)
    | ((aliasPrincipal: string) => Promise<void>);
  onError?: ((error: string) => void) | ((error: string) => Promise<void>);
}
