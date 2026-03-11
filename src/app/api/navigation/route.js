export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start'); 
  const end = searchParams.get('end');

  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?geometries=geojson&steps=true&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Navigation failed" }), { status: 500 });
  }
}