import { v2 as cloudinary } from 'cloudinary'

// 💡 Next.js looks explicitly for an exported uppercase 'POST' function handler
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { paramsToSign } = body

    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET, 
    })

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET!
    )

    return Response.json({ signature })
  } catch (err) {
    console.error("❌ Signature Endpoint Failure:", err)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
  