/**
 * api.ts
 *
 * Functions to call server APIs
 */
import axios from "axios";
import Cookies from "js-cookie";

export interface APIOptions {
  endpoint?: string;
}

export async function getEnv(
  options?: APIOptions
): Promise<{ [key: string]: string }> {
  try {
    const res = await axios.get(getEndpoint(options) + "/lib/api/info");
    if (res.data && res.status === 200) {
      return res.data.env;
    }
  } catch (e) {
    // do nothing.
  }
  return {};
}

export async function authenticate(token: string, options?: APIOptions) {
  try {
    const res = await axios.post(getEndpoint(options) + "/lib/api/auth", null, {
      auth: {
        username: "danoweb",
        password: token
      }
    });
    if (!res.data || !res.data.success) {
      return false;
    }
    Cookies.set("token", token, {
      expires: 60 /* days */
    });
    return true;
  } catch (e) {
    return false;
  }
}

export async function isAuthenticated() {
  const token = Cookies.get("token");
  return token && authenticate(token);
}

export async function download(options?: APIOptions) {
  return axios
    .get(getEndpoint(options) + "/lib/api/download", {
      auth: {
        username: "danoweb",
        password: Cookies.get("token")
      },
      responseType: "blob"
    })
    .then(res => {
      let fileName = "file.dat";
      if (res.headers["content-disposition"]) {
        const match = /^attachment;\s*filename="(.+)"$/.exec(
          res.headers["content-disposition"]
        );
        if (match) fileName = match[1];
      }
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
}

export async function getTextFile(filePath: string, options?: APIOptions) {
  try {
    const res = await axios.get(getEndpoint(options) + filePath);
    return res.data as string;
  } catch (_e) {
    return null;
  }
}

export async function putTextFile(
  filePath: string,
  options: APIOptions & { content: string }
) {
  const fileName = filePath.substr(filePath.lastIndexOf("/") + 1);
  const formData = new FormData();
  formData.append("path", filePath);
  formData.append(
    "content",
    new Blob([options.content], { type: "text/plain" }),
    fileName
  );
  const res = await axios.put(getEndpoint(options) + filePath, formData, {
    auth: {
      username: "danoweb",
      password: Cookies.get("token")
    }
  });
  return res.data as string;
}

function getEndpoint(options?: APIOptions) {
  return (options && options.endpoint) || "";
}
