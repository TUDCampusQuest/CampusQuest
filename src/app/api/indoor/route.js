export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  const allowed = new Set([
    'indoor/rooms',
    'indoor/stairs',
    'indoor/floorplans',
    'indoor/room-name-map',
    'buildings/locations',
    'routing/campusGraph',
    'routing/buildingRoutes',
    'data/buildings',
  ]);

  if (!allowed.has(file)) {
    return Response.json({ error: 'Not allowed' }, { status: 400 });
  }

  const base   = process.env.S3_BASE ?? process.env.NEXT_PUBLIC_S3_BASE;
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  const prefix = process.env.S3_KEY_PREFIX ?? 'tud-campus-nav';

  const s3Base = base ?? (bucket && region
    ? `https://${bucket}.s3.${region}.amazonaws.com/${prefix}`
    : null);

  if (!s3Base) {
    return Response.json({ error: 'S3 base URL not configured' }, { status: 500 });
  }

  const url = `${s3Base}/${file}.json`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`S3 ${res.status}: ${url}`);
    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
