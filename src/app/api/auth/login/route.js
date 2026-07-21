import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://localhost:8081/api";

function parseJsonSafely(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const phoneOrEmail =
      body.phoneOrEmail ||
      body.phone ||
      body.email;

    const password = body.password;
    const rememberMe = Boolean(body.rememberMe);

    if (!phoneOrEmail?.trim() || !password) {
      return Response.json(
        {
          message:
            "សូមបញ្ចូលលេខទូរស័ព្ទ/អ៊ីមែល និងលេខសម្ងាត់",
        },
        {
          status: 400,
        }
      );
    }

    /*
      1. Login to Spring Boot
    */
    const loginResponse = await fetch(
      `${BACKEND_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneOrEmail: phoneOrEmail.trim(),
          password,
        }),
        cache: "no-store",
      }
    );

    const loginText = await loginResponse.text();
    const loginData = parseJsonSafely(loginText);

    if (!loginResponse.ok) {
      return Response.json(
        {
          message:
            loginData.message ||
            "លេខទូរស័ព្ទ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ",
        },
        {
          status: loginResponse.status,
        }
      );
    }

    const accessToken =
      loginData.accessToken ||
      loginData.access_token ||
      loginData.data?.accessToken ||
      loginData.data?.access_token;

    const refreshToken =
      loginData.refreshToken ||
      loginData.refresh_token ||
      loginData.data?.refreshToken ||
      loginData.data?.refresh_token;

    if (!accessToken) {
      console.error(
        "Backend login response has no access token:",
        loginData
      );

      return Response.json(
        {
          message:
            "Backend did not return an access token",
        },
        {
          status: 500,
        }
      );
    }

    /*
      2. Load the real authenticated user
    */
    const meResponse = await fetch(
      `${BACKEND_URL}/auth/me`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    const meText = await meResponse.text();
    const currentUser = parseJsonSafely(meText);

    if (!meResponse.ok) {
      return Response.json(
        {
          message:
            currentUser.message ||
            "ចូលបាន ប៉ុន្តែមិនអាចទាញយកព័ត៌មានគណនីបាន",
        },
        {
          status: meResponse.status,
        }
      );
    }

    const normalizedRole = String(
      currentUser.role || ""
    )
      .trim()
      .toUpperCase();

    const supportedRoles = [
      "ADMIN",
      "SECRETARY",
      "BRANCH_LEADER",
      "MEMBER",
    ];

    if (!supportedRoles.includes(normalizedRole)) {
      return Response.json(
        {
          message:
            "គណនីនេះមិនមានតួនាទីត្រឹមត្រូវ",
        },
        {
          status: 403,
        }
      );
    }

    /*
      3. Save cookies
    */
    const cookieStore = await cookies();

    const commonCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    const accessCookieOptions = rememberMe
      ? {
          ...commonCookieOptions,
          maxAge: 60 * 60 * 24,
        }
      : commonCookieOptions;

    const refreshCookieOptions = rememberMe
      ? {
          ...commonCookieOptions,
          maxAge: 60 * 60 * 24 * 7,
        }
      : commonCookieOptions;

    cookieStore.set(
      "accessToken",
      accessToken,
      accessCookieOptions
    );

    cookieStore.set(
      "userRole",
      normalizedRole,
      accessCookieOptions
    );

    if (refreshToken) {
      cookieStore.set(
        "refreshToken",
        refreshToken,
        refreshCookieOptions
      );
    } else {
      cookieStore.delete("refreshToken");
    }

    /*
      4. Return user to the frontend
    */
    return Response.json(
      {
        success: true,
        user: {
          ...currentUser,
          role: normalizedRole,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Login proxy error:", error);

    return Response.json(
      {
        message:
          "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ",
      },
      {
        status: 500,
      }
    );
  }
}