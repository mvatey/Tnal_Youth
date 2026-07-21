// src/app/api/auth/login/route.js

import { cookies } from "next/headers";

const BACKEND_URL =
  process.env.BACKEND_API_URL || "http://localhost:8081/api";

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

    // 1. Authenticate with Spring Boot
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
        "Login response did not contain access token:",
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

    // 2. Use the access token to retrieve the authenticated user
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
      console.error(
        "Login succeeded but /auth/me failed:",
        currentUser
      );

      return Response.json(
        {
          message:
            currentUser.message ||
            "ចូលប្រើប្រាស់បាន ប៉ុន្តែមិនអាចទាញយកព័ត៌មានគណនីបាន",
        },
        {
          status: meResponse.status,
        }
      );
    }

    if (!currentUser?.role) {
      console.error(
        "/auth/me did not return a user role:",
        currentUser
      );

      return Response.json(
        {
          message:
            "គណនីនេះមិនមានតួនាទីប្រើប្រាស់ត្រឹមត្រូវ",
        },
        {
          status: 500,
        }
      );
    }

    const normalizedRole = String(currentUser.role)
      .trim()
      .toUpperCase();

    const allowedRoles = [
      "ADMIN",
      "SECRETARY",
      "BRANCH_LEADER",
      "MEMBER",
    ];

    if (!allowedRoles.includes(normalizedRole)) {
      return Response.json(
        {
          message:
            "តួនាទីរបស់គណនីនេះមិនត្រូវបានគាំទ្រ",
        },
        {
          status: 403,
        }
      );
    }

    // 3. Store authentication cookies
    const cookieStore = await cookies();

    const commonCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    cookieStore.set("accessToken", accessToken, {
      ...commonCookieOptions,
      maxAge: 60 * 60 * 24,
    });

    if (refreshToken) {
      cookieStore.set("refreshToken", refreshToken, {
        ...commonCookieOptions,
        maxAge: 60 * 60 * 24 * 7,
      });
    } else {
      cookieStore.delete("refreshToken");
    }

    cookieStore.set("userRole", normalizedRole, {
      ...commonCookieOptions,
      maxAge: 60 * 60 * 24,
    });

    // 4. Return login result plus authenticated user
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
        message: "មិនអាចភ្ជាប់ទៅម៉ាស៊ីនមេបានទេ",
      },
      {
        status: 500,
      }
    );
  }
}