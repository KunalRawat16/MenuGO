/**
 * GET /api/orders/stream?slug={restaurantSlug}
 *
 * Server-Sent Events endpoint for real-time order updates.
 * The owner's dashboard connects here after page load.
 * When a customer places an order, createOrderAction emits to this stream.
 *
 * Client-side usage:
 *   const es = new EventSource('/api/orders/stream?slug=my-restaurant');
 *   es.onmessage = (e) => {
 *     const { event, order } = JSON.parse(e.data);
 *     // 'order_created' | 'order_updated'
 *   };
 */
export async function GET(request) {
  const slug = new URL(request.url).searchParams.get('slug');

  if (!slug) {
    return new Response('Missing slug parameter', { status: 400 });
  }

  const { orderEmitter } = await import('@/lib/sse');
  const eventKey = `order:${slug}`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send a heartbeat comment every 25s to keep the connection alive
      // (proxies and load balancers close idle connections)
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 25_000);

      // Send initial connected message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: 'connected', slug })}\n\n`));

      // Listen for order events on this restaurant's channel
      const handler = (payload) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        } catch {
          // Client disconnected
          orderEmitter.off(eventKey, handler);
          clearInterval(heartbeat);
        }
      };

      orderEmitter.on(eventKey, handler);

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        orderEmitter.off(eventKey, handler);
        clearInterval(heartbeat);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx buffering
    },
  });
}
