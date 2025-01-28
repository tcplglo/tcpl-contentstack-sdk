import dotenv from "dotenv";
import { HttpClientError } from "./types/HttpClientError";
dotenv.config();

class HttpClient {
  key: string;
  token: string;
  baseUrl: string = "https://api.contentstack.io/v3/";

  constructor() {
    this.key = process.env.CONTENTSTACK_API_KEY!;
    this.token = process.env.CONTENTSTACK_MANAGEMENT_TOKEN!;
  }

  public async get(url: string) {
    return await fetch(`${this.baseUrl}${url}`, {
      method: "GET",
      headers: new Headers({
        api_key: this.key,
        authorization: this.token,
        "Content-Type": "application/json",
      }),
    }).then((response) => {
      if (!response.ok) {
        const error: HttpClientError = {
          message: response.statusText,
          status: response.status,
        };
        return error;
      }

      return response.json();
    });
  }

  public async delete(url: string, params?: { [key: string]: string }) {
    let queryString = "";
    if (params) {
      queryString = Object.keys(params)
        .map((key) => key + "=" + params[key])
        .join("&");
    }
    if (queryString.length > 0) {
      queryString = "?" + queryString;
    }
    let composedUrl = this.baseUrl + url + queryString;
    console.log("composed uRL: ", composedUrl);
    return await fetch(composedUrl, {
      method: "DELETE",
      headers: new Headers({
        api_key: this.key,
        authorization: this.token,
        "Content-Type": "application/json",
      }),
    }).then((response) => {
      if (!response.ok) {
        const error: HttpClientError = {
          message: response.statusText,
          status: response.status,
        };
        return error;
      }

      return response.json();
    });
  }

  public async post(url: string, body: any) {
    return await fetch(`${this.baseUrl}${url}`, {
      method: "POST",
      headers: new Headers({
        api_key: this.key,
        authorization: this.token,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(body),
    }).then((response) => {
      if (!response.ok) {
        const error: HttpClientError = {
          message: response.statusText,
          status: response.status,
        };
        return error;
      }

      return response.json();
    });
  }

  public async put(url: string, body: any) {
    return await fetch(`${this.baseUrl}${url}`, {
      method: "PUT",
      headers: new Headers({
        api_key: this.key,
        authorization: this.token,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(body),
    }).then((response) => {
      if (!response.ok) {
        const error: HttpClientError = {
          message: response.statusText,
          status: response.status,
        };
        return error;
      }

      return response.json();
    });
  }
}

export { HttpClient };
