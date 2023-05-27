import {
  ConnectOptions,
  ConnectRequest,
  ConnectResponse,
  ConnectResponseSuccess,
} from "./types";

const MESSITY_URL = "http://localhost:8080/connect";

export default class MessityConnect {
  private static _window?: Window;
  private static eventHandler?: (event: MessageEvent) => void;

  public static connect(options: ConnectOptions) {
    this.removeEventListener();

    const messityUrl = new URL(options?.messityUrl || MESSITY_URL);

    this.eventHandler = this.getEventHandler(messityUrl, options);
    window.addEventListener("message", this.eventHandler);

    this._window =
      window.open(messityUrl.toString(), "messityWindow") ?? undefined;

    const checkInterruption = (): void => {
      if (this._window) {
        if (this._window.closed) {
          this.handleFailure(
            "User closed the Messity connect window",
            options?.onError
          );
        } else {
          setTimeout(checkInterruption, 500);
        }
      }
    };
    checkInterruption();
  }

  private static getEventHandler(
    identityProviderUrl: URL,
    options: ConnectOptions
  ) {
    return async (event: MessageEvent) => {
      if (event.origin !== identityProviderUrl.origin) {
        console.warn(
          `WARNING: expected origin '${identityProviderUrl.origin}', got '${event.origin}' (ignoring)`
        );
        return;
      }

      const message = event.data as ConnectResponse;

      switch (message.kind) {
        case "connect-ready": {
          const request: ConnectRequest = {
            senderName: options.senderName,
          };
          this._window?.postMessage(request, identityProviderUrl.origin);
          break;
        }
        case "connect-success":
          try {
            await this.handleSuccess(message, options?.onSuccess);
          } catch (err) {
            this.handleFailure((err as Error).message, options?.onError);
          }
          break;
        case "connect-error":
          this.handleFailure(message.error, options?.onError);
          break;
        default:
          break;
      }
    };
  }

  private static async handleSuccess(
    message: ConnectResponseSuccess,
    onSuccess?: (aliasPrincipal: string) => void
  ) {
    // this._window?.close();

    this.removeEventListener();
    delete this._window;

    onSuccess?.(message.aliasPrincipal);
  }

  private static handleFailure(
    errorMessage: string,
    onError?: (error: string) => void
  ): void {
    // this._window?.close();

    onError?.(errorMessage);
    this.removeEventListener();
    delete this._window;
  }

  private static removeEventListener() {
    if (this.eventHandler) {
      window.removeEventListener("message", this.eventHandler);
    }
    this.eventHandler = undefined;
  }
}
