import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();

    const phoneOrEmail = String(
      body.phoneOrEmail ||
        body.phone ||
        body.email ||
        "",
    ).trim();

    const otp = String(
      body.otp ||
        body.code ||
        "",
    ).trim();

    if (!phoneOrEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "សូមបញ្ចូលលេខទូរស័ព្ទ ឬអ៊ីមែល",
        },
        {
          status: 400,
        },
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "សូមបញ្ចូលលេខកូដ OTP ចំនួន ៦ ខ្ទង់",
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,
        phoneOrEmail,
        otp,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Verify OTP route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "មិនអាចផ្ទៀងផ្ទាត់លេខកូដ OTP បាន",
      },
      {
        status: 500,
      },
    );
  }
}