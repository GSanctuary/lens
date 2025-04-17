export class Fetch<T> {
  private remoteServiceModule: RemoteServiceModule;
  private httpMethod: RemoteServiceHttpRequest.HttpRequestMethod;
  private requestUrl: string;
  private requestBody: string;
  private requestHeaders: { [key: string]: string } = {};

  constructor(remoteServiceModule: RemoteServiceModule) {
    this.remoteServiceModule = remoteServiceModule;
    this.httpMethod = RemoteServiceHttpRequest.HttpRequestMethod.Get;
  }

  method = (desiredMethod: RemoteServiceHttpRequest.HttpRequestMethod) => {
    this.httpMethod = desiredMethod;
    return this;
  };

  url = (desiredUrl: string) => {
    this.requestUrl = desiredUrl;
    return this;
  };

  body = (desiredBody: T) => {
    this.requestBody = JSON.stringify(desiredBody);
    return this;
  };

  headers = (desiredHeaders: { [key: string]: string }) => {
    this.requestHeaders = desiredHeaders;
    return this;
  };

  perform = (callback: (response: RemoteServiceHttpResponse) => void) => {
    const request = RemoteServiceHttpRequest.create();
    request.method = this.httpMethod;
    request.url = this.requestUrl;
    request.body = this.requestBody;
    request.headers = this.requestHeaders;

    this.remoteServiceModule.performHttpRequest(request, (response) => {
      print(`HTTP CODE ${response.statusCode}`);
      print(`Content-Type: ${response.contentType}`);
      print(`Headers: ${JSON.stringify(response.headers)}`);
      print(response.body);
      print(request.url);
      callback(response);
    });
  };
}
