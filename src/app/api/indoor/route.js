export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  const allowed = [
    'indoor/rooms',
    'indoor/stairs',
    'indoor/floorplans',
    'buildings/locations',
    'routing/campusGraph',
    'routing/buildingRoutes',
  ];

  if (!allowed.includes(file)) {
    return Response.json({ error: 'Not allowed' }, { status: 400 });
  }

  const url = `${process.env.NEXT_PUBLIC_S3_BASE}/${file}.json`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`S3 fetch failed: ${res.status}`);
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}